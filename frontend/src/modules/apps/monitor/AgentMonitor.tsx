import { useEffect } from 'react'
import { useMonitorStore, selectFilteredSessions, selectCurrentSession } from '../../../stores/monitorStore'
import { MonitorToolbar } from './MonitorToolbar'
import { SessionList } from './SessionList'
import { SessionDetailPanel } from './SessionDetailPanel'

// ─── AgentMonitor ─────────────────────────────────────────────────────────────

export default function AgentMonitor() {
  const {
    isLoading,
    error,
    selectedSessionId,
    fetchSessions,
    selectSession,
    connectSSE,
  } = useMonitorStore()

  const sessions = useMonitorStore(selectFilteredSessions)
  const selectedSession = useMonitorStore(selectCurrentSession)

  // On mount: initial fetch + connect SSE (SSE internally handles polling fallback)
  // cleanup on unmount disconnects SSE and clears any polling timers
  useEffect(() => {
    fetchSessions()
    const cleanup = connectSSE()
    return cleanup
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-full bg-gray-900/95 text-white select-none overflow-hidden">
      {/* Toolbar */}
      <MonitorToolbar />

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Session list */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Status bar */}
          {error && (
            <div className="px-3 py-1.5 text-xs text-red-400 bg-red-500/10 border-b border-red-500/20">
              ⚠ {error}
            </div>
          )}
          {isLoading && sessions.length === 0 && (
            <div className="flex-1 flex items-center justify-center text-white/30 text-sm">
              Loading…
            </div>
          )}

          <SessionList
            sessions={sessions}
            selectedId={selectedSessionId}
            onSelect={selectSession}
          />
        </div>

        {/* Detail panel (conditional) */}
        {selectedSession && (
          <SessionDetailPanel
            session={selectedSession}
            onClose={() => selectSession(null)}
          />
        )}
      </div>
    </div>
  )
}
