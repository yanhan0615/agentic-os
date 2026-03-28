import { Hono } from 'hono'
import type { ApiError } from '@agentic-os/types'

export const fsRouter = new Hono()

// List directory contents
fsRouter.get('/*', (c) => {
  const path = c.req.path || '/'
  // Stub: return mock directory listing
  return c.json({
    path,
    entries: [
      { name: 'Desktop', type: 'directory' },
      { name: 'Documents', type: 'directory' },
      { name: 'Downloads', type: 'directory' },
    ],
  })
})

// Create file/directory (stub)
fsRouter.post('/*', async (c) => {
  const body = await c.req.json()
  return c.json({ created: true, ...body }, 201)
})

// Delete file/directory (stub)
fsRouter.delete('/*', (c) => {
  return c.json({ deleted: true })
})
