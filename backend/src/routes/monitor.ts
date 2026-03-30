import { Hono } from 'hono'
import { streamSSE } from 'hono/streaming'
import type { AgentSession, ApiError } from '@agentic-os/types'

export const monitorRouter = new Hono()

// ─── OpenClaw local API ───────────────────────────────────────────────────────

const OPENCLAW_BASE = process.env.OPENCLAW_API_URL ?? 'http://localhost:34580'

interface OpenClawSession {
  sessionKey: string
  label?: string
  agentId?: string
  kind?: string
  model?: string
  status?: string
  startedAt?: number
  lastActiveAt?: number
  usage?: {
    inputTokens?: number
    outputTokens?: number
    totalTokens?: number
    estimatedCostUsd?: number
  }
  lastMessages?: Array<{
    role: string
    content?: string
    text?: string
    timestamp?: number
  }>
}

async function fetchOpenClawSessions(): Promise<OpenClawSession[]> {
  const res = await fetch(`${OPENCLAW_BASE}/api/sessions/list`, {
    headers: { 'Content-Type': 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`OpenClaw sessions_list failed: ${res.status}`)
  }
  const data = await res.json() as { sessions?: OpenClawSession[] }
  return data.sessions ?? []
}

function mapStatus(raw?: string): AgentSession['status'] {
  switch (raw) {
    case 'active':
      return 'active'
    case 'idle':
      return 'idle'
    case 'error':
      return 'error'
    case 'terminated':
    case 'closed':
      return 'terminated'
    default:
      return 'idle'
  }
}

function toAgentSession(s: OpenClawSession): AgentSession {
  const now = Date.now()
  const startedAt = s.startedAt ?? now
  return {
    id: s.sessionKey,
    agentId: s.agentId ?? s.sessionKey,
    agentName: s.label ?? s.agentId ?? s.sessionKey,
    status: mapStatus(s.status),
    currentTask: null,
    startedAt,
    durationMs: now - startedAt,
    model: s.model ?? 'unknown',
    usage: {
      inputTokens: s.usage?.inputTokens ?? 0,
      outputTokens: s.usage?.outputTokens ?? 0,
      totalTokens: s.usage?.totalTokens ?? 0,
      estimatedCostUsd: s.usage?.estimatedCostUsd ?? 0,
    },
  }
}

// ─── GET /monitor/sessions ────────────────────────────────────────────────────

monitorRouter.get('/sessions', async (c) => {
  try {
    const raw = await fetchOpenClawSessions()
    const sessions = raw.map(toAgentSession)
    return c.json({ sessions, total: sessions.length, fetchedAt: Date.now() })
  } catch (err) {
    const error: ApiError = {
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch sessions',
      },
    }
    return c.json(error, 502)
  }
})

// ─── GET /monitor/sessions/stream (SSE) ───────────────────────────────────────

monitorRouter.get('/sessions/stream', async (c) => {
  return streamSSE(c, async (stream) => {
    // Initial snapshot
    try {
      const raw = await fetchOpenClawSessions()
      const sessions = raw.map(toAgentSession)
      await stream.writeSSE({
        event: 'snapshot',
        data: JSON.stringify({ sessions, total: sessions.length, fetchedAt: Date.now() }),
      })
    } catch (err) {
      await stream.writeSSE({
        event: 'error',
        data: JSON.stringify({ message: err instanceof Error ? err.message : 'snapshot failed' }),
      })
    }

    let elapsed = 0
    while (!stream.aborted) {
      await stream.sleep(5000)
      elapsed += 5000

      if (elapsed % 30000 === 0) {
        // Heartbeat every 30s
        await stream.writeSSE({ event: 'heartbeat', data: String(Date.now()) })
      } else {
        // Delta every 5s (for now: full snapshot as delta; real delta can be layered later)
        try {
          const raw = await fetchOpenClawSessions()
          const sessions = raw.map(toAgentSession)
          await stream.writeSSE({
            event: 'delta',
            data: JSON.stringify({ sessions, total: sessions.length, fetchedAt: Date.now() }),
          })
        } catch {
          // Don't break the stream on transient errors
        }
      }
    }
  })
})

// ─── GET /monitor/sessions/:id ────────────────────────────────────────────────

monitorRouter.get('/sessions/:id', async (c) => {
  const id = c.req.param('id')
  try {
    const raw = await fetchOpenClawSessions()
    const found = raw.find((s) => s.sessionKey === id)
    if (!found) {
      const error: ApiError = { error: { code: 'NOT_FOUND', message: `Session ${id} not found` } }
      return c.json(error, 404)
    }
    const session = toAgentSession(found)
    // Attach up to 10 recent messages
    if (found.lastMessages && found.lastMessages.length > 0) {
      session.recentMessages = found.lastMessages.slice(-10).map((m) => ({
        role: (m.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
        preview: (m.content ?? m.text ?? '').slice(0, 200),
        timestamp: m.timestamp ?? Date.now(),
      }))
    }
    return c.json(session)
  } catch (err) {
    const error: ApiError = {
      error: {
        code: 'UPSTREAM_ERROR',
        message: err instanceof Error ? err.message : 'Failed to fetch session',
      },
    }
    return c.json(error, 502)
  }
})
