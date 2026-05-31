import type { NextApiRequest, NextApiResponse } from 'next'

declare const require: (name: string) => unknown

type AccessPayload = {
  fullName: string
  email: string
  organization: string
  reason: string
}

type AccessErrors = Partial<Record<keyof AccessPayload, string>>

type EmailConfig = {
  host?: string
  port: number
  secure: boolean
  user?: string
  pass?: string
  from?: string
  adminEmail?: string
}

type AccessResponse = {
  message: string
  errors?: AccessErrors
  missing?: string[]
}

type NodemailerTransport = {
  sendMail: (message: {
    from?: string
    to?: string
    replyTo: string
    subject: string
    text: string
  }) => Promise<unknown>
}

type NodemailerModule = {
  createTransport: (options: {
    host?: string
    port: number
    secure: boolean
    auth: {
      user?: string
      pass?: string
    }
  }) => NodemailerTransport
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function validatePayload(payload: AccessPayload): AccessErrors {
  const errors: AccessErrors = {}

  if (!payload.fullName || payload.fullName.trim().length < 2) {
    errors.fullName = 'Full name is required.'
  }

  if (!payload.email || !isEmail(payload.email)) {
    errors.email = 'A valid email is required.'
  }

  if (!payload.organization || payload.organization.trim().length < 2) {
    errors.organization = 'Organization is required.'
  }

  if (!payload.reason || payload.reason.trim().length < 10) {
    errors.reason = 'Please provide a short reason (at least 10 characters).'
  }

  return errors
}

function readEmailConfig(): EmailConfig {
  const env =
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env || {}

  return {
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT || 587),
    secure: env.SMTP_SECURE === 'true',
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
    from: env.FROM_EMAIL || env.SMTP_USER,
    adminEmail: env.ADMIN_EMAIL,
  }
}

function missingConfig(config: EmailConfig): string[] {
  const missing: string[] = []
  if (!config.host) missing.push('SMTP_HOST')
  if (!config.user) missing.push('SMTP_USER')
  if (!config.pass) missing.push('SMTP_PASS')
  if (!config.adminEmail) missing.push('ADMIN_EMAIL')
  if (!config.from) missing.push('FROM_EMAIL or SMTP_USER')
  return missing
}

async function sendAccessRequestEmail(config: EmailConfig, payload: AccessPayload): Promise<void> {
  const nodemailer = require('nodemailer') as NodemailerModule
  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.user,
      pass: config.pass,
    },
  })

  const subject = `Calendar access request: ${payload.fullName}`
  const body = [
    'A new user requested calendar access.',
    '',
    `Name: ${payload.fullName}`,
    `Email: ${payload.email}`,
    `Organization: ${payload.organization}`,
    '',
    'Reason:',
    payload.reason,
  ].join('\n')

  await transporter.sendMail({
    from: config.from,
    to: config.adminEmail,
    replyTo: payload.email,
    subject,
    text: body,
  })
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<AccessResponse>
): Promise<void> {
  const method = (req as { method?: string }).method
  const body = (req as { body?: Partial<Record<keyof AccessPayload, string>> }).body

  if (method !== 'POST') {
    res.setHeader('Allow', ['POST'])
    res.status(405).json({ message: 'Method not allowed.' })
    return
  }

  const payload: AccessPayload = {
    fullName: String(body?.fullName || '').trim(),
    email: String(body?.email || '').trim().toLowerCase(),
    organization: String(body?.organization || '').trim(),
    reason: String(body?.reason || '').trim(),
  }

  const errors = validatePayload(payload)
  if (Object.keys(errors).length > 0) {
    res.status(400).json({ message: 'Please fix the highlighted fields.', errors })
    return
  }

  const config = readEmailConfig()
  const missing = missingConfig(config)
  if (missing.length > 0) {
    res.status(500).json({
      message: 'Email service is not configured on the server.',
      missing,
    })
    return
  }

  try {
    await sendAccessRequestEmail(config, payload)
    res.status(200).json({ message: 'Access request sent. An administrator will review it.' })
  } catch (_error) {
    res.status(500).json({
      message: 'Unable to send request email right now. Please try again later.',
    })
  }
}
