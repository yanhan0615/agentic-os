import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { AgentInvokeRequest } from '@agentic-os/types'

export const agentRouter = new Hono()

// Invoke agent with SSE streaming response
agentRouter.post('/invoke', async (c) => {
  const body = await c.req.json<AgentInvokeRequest>()

  return streamSSE(c, async (stream) => {
    // Stub: echo back the prompt as a streaming response
    const words = `[Agent stub] Received: ${body.prompt}`.split(' ')

    for (const word of words) {
      await stream.writeSSE({
        data: JSON.stringify({ status: 'streaming', content: word + ' ' }),
      })
      await stream.sleep(80)
    }

    await stream.writeSSE({
      data: JSON.stringify({ status: 'done', content: '' }),
    })
  })
})
