// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

type HelloResponse = {
  statusCode: number
  json: (body: { name: string }) => void
}

export default function handler(_req: unknown, res: HelloResponse) {
  res.statusCode = 200
  res.json({ name: 'John Doe' })
}
