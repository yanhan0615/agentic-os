import { create } from 'zustand'
import type { AgentSession } from '@agentic-os/types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface MonitorState {
  sessions: AgentSession[]
  selectedSessionId: string | null
  lastFetchedAt: number | null
  autoRefresh: boolean
  refreshIntervalSec: number
  searchQuery: string
  isLoading: boolean
  error: string | null
}

interface MonitorActions {
  fetchSessions: () => Promise<void>
  selectSession: (id: string | null) => void
  setAutoRefresh: (enabled: boolean) => void
  setSearchQuery: (q: string) => void
  /** Connect via SSE; returns cleanup function. Falls back to polling on error. */
  connectSSE: () => () => void
}

// ─── Store ────────────────────────────────────────────────────────────────────

const API_BASE = '/agentic-os/api/monitor'

export const useMonitorStore = create<MonitorState & MonitorActions>((set, get) => ({
  // ── State ────────────────────────────────────────────────────────────────────
  sessions: [],
  selectedSessionId: null,
  lastFetchedAt: null,
  autoRefresh: true,
  refreshIntervalSec: 5,
  searchQuery: '',
  isLoading: false,
  error: null,

  // ── Actions ──────────────────────────────────────────────────────────────────

  fetchSessions: async () => {
    set({ isLoading: true, error: null })
    try {
      const res = await fetch(`${API_BASE}/sessions`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body?.error?.message ?? `HTTP ${res.status}`)
      }
      const data = await res.json() as { sessions: AgentSession[]; total: number; fetchedAt: number }
      set({ sessions: data.sessions, lastFetchedAt: data.fetchedAt, isLoading: false })
    } catch (err) {
      set({ isLoading: false, error: err instanceof Error ? err.message : 'fetch failed' })
    }
  },

  selectSession: (id) => set({ selectedSessionId: id }),

  setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),

  setSearchQuery: (q) => set({ searchQuery: q }),

  connectSSE: () => {
    let es: EventSource | null = null
    let pollTimer: ReturnType<typeof setInterval> | null = null
    let closed = false

    const stopPolling = () => {
      if (pollTimer !== null) {
        clearInterval(pollTimer)
        pollTimer = null
      }
    }

    const startPolling = () => {
      stopPolling()
      if (!get().autoRefresh) return
      pollTimer = setInterval(() => {
        if (get().autoRefresh) {
          get().fetchSessions()
        }
      }, get().refreshIntervalSec * 1000)
    }

    const closeSSE = () => {
      if (es) {
        es.close()
        es = null
      }
    }

    const connectSSE = () => {
      if (closed) return
      closeSSE()

      es = new EventSource(`${API_BASE}/sessions/stream`)

      es.addEventListener('snapshot', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as { sessions: AgentSession[]; fetchedAt: number }
          stopPolling() // SSE is working, no need for polling
          set({ sessions: data.sessions, lastFetchedAt: data.fetchedAt, error: null })
        } catch { /* ignore parse errors */ }
      })

      es.addEventListener('delta', (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data) as { sessions: AgentSession[]; fetchedAt: number }
          if (data.sessions.length === 0) return
          // Merge delta: only update changed sessions, preserve the rest
          set((state) => ({
            sessions: state.sessions.map((s) => {
              const updated = data.sessions.find((d) => d.id === s.id)
              return updated ?? s
            }),
            lastFetchedAt: data.fetchedAt,
            error: null,
          }))
        } catch { /* ignore parse errors */ }
      })

      es.addEventListener('heartbeat', () => {
        // SSE still alive — nothing to do
      })

      es.addEventListener('error', () => {
        closeSSE()
        if (!closed) {
          // Degrade to polling
          set({ error: 'SSE disconnected, falling back to polling' })
          startPolling()
          // Retry SSE after 10s
          setTimeout(() => {
            stopPolling()
            connectSSE()
          }, 10_000)
        }
      })
    }

    // Kick off SSE
    connectSSE()

    // Cleanup function returned to caller
    return () => {
      closed = true
      closeSSE()
      stopPolling()
    }
  },
}))

// ─── Derived selectors ────────────────────────────────────────────────────────

/** Filtered sessions based on searchQuery (matches agentName, agentId, or status) */
export const selectFilteredSessions = (state: MonitorState): AgentSession[] => {
  const q = state.searchQuery.trim().toLowerCase()
  if (!q) return state.sessions
  return state.sessions.filter(
    (s) =>
      s.agentName.toLowerCase().includes(q) ||
      s.agentId.toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q),
  )
}

/** Currently selected session object (or null) */
export const selectCurrentSession = (state: MonitorState): AgentSession | null =>
  state.sessions.find((s) => s.id === state.selectedSessionId) ?? null
