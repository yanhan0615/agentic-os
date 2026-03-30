import type { AgentSession } from '@agentic-os/types'

// ─── StatusBadge ─────────────────────────────────────────────────────────────

const STATUS_CONFIG = {
  active:     { label: 'Active',      dot: 'bg-green-400',   text: 'text-green-400' },
  idle:       { label: 'Idle',        dot: 'bg-gray-400',    text: 'text-gray-400' },
  error:      { label: 'Error',       dot: 'bg-red-400',     text: 'text-red-400' },
  terminated: { label: 'Terminated',  dot: 'bg-gray-600',    text: 'text-gray-500' },
} satisfies Record<AgentSession['status'], { label: string; dot: string; text: string }>

export function StatusBadge({ status }: { status: AgentSession['status'] }) {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${status === 'active' ? 'animate-pulse' : ''}`} />
      {cfg.label}
    </span>
  )
}

// ─── SessionListHeader ────────────────────────────────────────────────────────

export function SessionListHeader() {
  return (
    <div className="grid grid-cols-[1fr_90px_80px_90px] gap-2 px-3 py-1.5 text-xs text-white/40 uppercase tracking-wider border-b border-white/10 select-none">
      <span>Agent</span>
      <span>Status</span>
      <span className="text-right">Tokens</span>
      <span className="text-right">Cost</span>
    </div>
  )
}

// ─── SessionRow ───────────────────────────────────────────────────────────────

interface SessionRowProps {
  session: AgentSession
  selected: boolean
  onClick: () => void
}

function formatTokens(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`
  return String(n)
}

function formatCost(usd: number): string {
  if (usd === 0) return '—'
  if (usd < 0.001) return '<$0.001'
  return `$${usd.toFixed(3)}`
}

export function SessionRow({ session, selected, onClick }: SessionRowProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full grid grid-cols-[1fr_90px_80px_90px] gap-2 px-3 py-2.5 text-left
        hover:bg-white/5 transition-colors border-b border-white/5 cursor-pointer
        ${selected ? 'bg-white/10 hover:bg-white/10' : ''}`}
    >
      {/* Agent name + current task */}
      <div className="min-w-0">
        <div className="text-sm font-medium text-white truncate">{session.agentName}</div>
        {session.currentTask && (
          <div className="text-xs text-white/40 truncate mt-0.5">{session.currentTask}</div>
        )}
      </div>

      {/* Status badge */}
      <div className="flex items-center">
        <StatusBadge status={session.status} />
      </div>

      {/* Token count */}
      <div className="flex items-center justify-end text-xs text-white/60">
        {formatTokens(session.usage.totalTokens)}
      </div>

      {/* Cost */}
      <div className="flex items-center justify-end text-xs text-white/60">
        {formatCost(session.usage.estimatedCostUsd)}
      </div>
    </button>
  )
}

// ─── SessionList ──────────────────────────────────────────────────────────────

interface SessionListProps {
  sessions: AgentSession[]
  selectedId: string | null
  onSelect: (id: string | null) => void
}

export function SessionList({ sessions, selectedId, onSelect }: SessionListProps) {
  if (sessions.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/30 text-sm select-none">
        No sessions found
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <SessionListHeader />
      {sessions.map((s) => (
        <SessionRow
          key={s.id}
          session={s}
          selected={s.id === selectedId}
          onClick={() => onSelect(s.id === selectedId ? null : s.id)}
        />
      ))}
    </div>
  )
}
