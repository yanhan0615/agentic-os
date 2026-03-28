import { Hono } from 'hono'

export const systemRouter = new Hono()

systemRouter.get('/info', (c) => {
  return c.json({
    name: 'Agentic OS',
    version: '0.1.0',
    build: process.env.NODE_ENV ?? 'development',
    uptime: process.uptime?.() ?? 0,
  })
})
