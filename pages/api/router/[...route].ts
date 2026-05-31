import type { NextApiRequest, NextApiResponse } from 'next'

type ApiJson = Record<string, unknown>

type RouteContext = {
  params: Record<string, string>
}

type RouteHandler = (
  req: NextApiRequest,
  res: NextApiResponse<ApiJson>,
  ctx: RouteContext
) => Promise<void> | void

type RouteDef = {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  pattern: string
  handler: RouteHandler
}

function normalizeSegments(value: string | string[] | undefined): string[] {
  if (!value) return []
  return Array.isArray(value) ? value : [value]
}

function normalizePath(segments: string[]): string {
  if (segments.length === 0) return '/'
  return `/${segments.join('/')}`
}

function matchPath(pattern: string, path: string): Record<string, string> | null {
  const patternParts = pattern.split('/').filter(Boolean)
  const pathParts = path.split('/').filter(Boolean)

  if (patternParts.length !== pathParts.length) {
    return null
  }

  const params: Record<string, string> = {}

  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i]
    const pathPart = pathParts[i]

    if (patternPart.startsWith(':')) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart)
      continue
    }

    if (patternPart !== pathPart) {
      return null
    }
  }

  return params
}

const routes: RouteDef[] = [
  {
    method: 'GET',
    pattern: '/health',
    handler: (_req, res) => {
      res.status(200).json({ ok: true, service: 'api-router', timestamp: new Date().toISOString() })
    },
  },
  {
    method: 'POST',
    pattern: '/echo',
    handler: (req, res) => {
      res.status(200).json({ ok: true, body: req.body ?? null })
    },
  },
  {
    method: 'GET',
    pattern: '/calendar/:year/:month',
    handler: (_req, res, ctx) => {
      const year = Number(ctx.params.year)
      const month = Number(ctx.params.month)

      if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12) {
        res.status(400).json({
          ok: false,
          message: 'Use /api/router/calendar/{year}/{month} with month from 1-12.',
        })
        return
      }

      const daysInMonth = new Date(year, month, 0).getDate()
      res.status(200).json({
        ok: true,
        year,
        month,
        daysInMonth,
      })
    },
  },
]

export default async function handler(req: NextApiRequest, res: NextApiResponse<ApiJson>): Promise<void> {
  const segments = normalizeSegments(req.query.route)
  const path = normalizePath(segments)
  const method = (req.method || 'GET').toUpperCase() as RouteDef['method']

  const pathMatches = routes
    .map((route) => ({ route, params: matchPath(route.pattern, path) }))
    .filter((entry): entry is { route: RouteDef; params: Record<string, string> } => entry.params !== null)

  if (pathMatches.length === 0) {
    res.status(404).json({
      ok: false,
      message: `No route found for ${path}`,
    })
    return
  }

  const selected = pathMatches.find((entry) => entry.route.method === method)
  if (!selected) {
    const allowed = Array.from(new Set(pathMatches.map((entry) => entry.route.method)))
    res.setHeader('Allow', allowed)
    res.status(405).json({
      ok: false,
      message: `Method ${method} not allowed for ${path}`,
      allowed,
    })
    return
  }

  try {
    await selected.route.handler(req, res, { params: selected.params })
  } catch (_error) {
    res.status(500).json({
      ok: false,
      message: 'Unexpected server error in API router.',
    })
  }
}

