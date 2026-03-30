import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { fsRouter } from './routes/fs'
import { agentRouter } from './routes/agent'
import { systemRouter } from './routes/system'
import { wallpaperRouter } from './routes/wallpaper'
import { monitorRouter } from './routes/monitor'

const app = new Hono().basePath('/agentic-os/api')

// Middleware
app.use('*', logger())
app.use('*', cors({ origin: '*' }))

// Routes
app.route('/fs', fsRouter)
app.route('/agent', agentRouter)
app.route('/system', systemRouter)
app.route('/wallpaper', wallpaperRouter)
app.route('/monitor', monitorRouter)

// Health check
app.get('/health', (c) => c.json({ status: 'ok', version: '0.1.0' }))

// 404 fallback
app.notFound((c) => c.json({ error: { code: 'NOT_FOUND', message: 'Route not found' } }, 404))

console.log('🚀 Agentic OS API running on http://localhost:8765')
console.log('   Base path: /agentic-os/api')

export default {
  port: 8765,
  fetch: app.fetch,
}
