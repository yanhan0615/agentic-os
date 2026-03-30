import { useEffect, useState } from 'react'
import type { AgentSession, SessionMessage } from '@agentic-os/types'
import { StatusBadge } from './SessionList'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m ${s % 60}s`
  return `${Math.floor(m / 60)}h ${m % 60}m`
}

function formatDateTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MetaGrid({ session }: { session: AgentSession }) {
  return (
    <div className="grid grid-cols-3 gap-3 text-xs">
      <div>
        <div className="text-white/40 mb-0.5">Started</div>
        <div className="text-white/80">{formatDateTime(session.startedAt)}</div>
      </div>
      <div>
        <div className="text-white/40 mb-0.5">Duration</div>
        <div className="text-white/80">{formatDuration(session.durationMs)}</div>
      </div>
      <div>
        <div className="text-white/40 mb-0.5">Model</div>
        <div className="text-white/80 truncate" title={session.model}>{session.model}</div>
      </div>
    </div>
  )
}

function UsageBreakdown({ usage }: { usage: AgentSession['usage'] }) {
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Usage</div>
      <div className="grid grid-cols-2 gap-2 text-xs">
        {[
          { label: 'Input tokens',  value: usage.inputTokens.toLocaleString() },
          { label: 'Output tokens', value: usage.outputTokens.toLocaleString() },
          { label: 'Total tokens',  value: usage.totalTokens.toLocaleString() },
          { label: 'Est. cost',     value: usage.estimatedCostUsd > 0 ? `$${usage.estimatedCostUsd.toFixed(4)}` : '—' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white/5 rounded-lg px-3 py-2">
            <div className="text-white/40">{label}</div>
            <div className="text-white font-mono mt-0.5">{value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

function RecentMessages({ messages }: { messages: SessionMessage[] }) {
  if (messages.length === 0) return null
  return (
    <div className="space-y-1.5">
      <div className="text-xs text-white/40 uppercase tracking-wider mb-2">Recent Messages</div>
      <div className="space-y-1.5 overflow-y-auto max-h-48">
        {messages.map((msg, i) => (
          <div key={i} className={`rounded-lg px-3 py-2 text-xs ${
            msg.role === 'assistant' ? 'bg-blue-500/10 border border-blue-500/20' : 'bg-white/5'
          }`}>
            <div className="text-white/40 mb-0.5 capitalize">{msg.role}</div>
            <div className="text-white/70 line-clamp-2">{msg.preview}</div>
            <div className="text-white/30 mt-1">{formatDateTime(msg.timestamp)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── SessionDetailPanel ───────────────────────────────────────────────────────

const API_BASE = '/agentic-os/api/monitor'

interface Props {
  session: AgentSession
  onClose: () => void
}

export function SessionDetailPanel({ session, onClose }: Props) {
  const [messages, setMessages] = useState<SessionMessage[]>(session.recentMessages ?? [])
  const [loadingMsgs, setLoadingMsgs] = useState(false)

  // Lazy-load recentMessages if not already present
  useEffect(() => {
    if (session.recentMessages && session.recentMessages.length > 0) {
      setMessages(session.recentMessages)
      return
    }
    setLoadingMsgs(true)
    fetch(`${API_BASE}/sessions/${encodeURIComponent(session.id)}`)
      .then((r) => r.json())
      .then((data: AgentSession) => {
        setMessages(data.recentMessages ?? [])
      })
      .catch(() => { /* silently fail */ })
      .finally(() => setLoadingMsgs(false))
  }, [session.id])

  return (
    <div className="w-72 flex-shrink-0 border-l border-white/10 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-white truncate">{session.agentName}</div>
          <div className="mt-0.5">
            <StatusBadge status={session.status} />
          </div>
        </div>
        <button
          onClick={onClose}
          className="ml-2 text-white/40 hover:text-white/80 transition-colors text-lg leading-none"
          aria-label="Close detail"
        >
          ×
        </button>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
        {session.currentTask && (
          <div>
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Current Task</div>
            <div className="text-white/80 text-xs">{session.currentTask}</div>
          </div>
        )}
        <MetaGrid session={session} />
        <UsageBreakdown usage={session.usage} />
        {loadingMsgs ? (
          <div className="text-xs text-white/30">Loading messages…</div>
        ) : (
          <RecentMessages messages={messages} />
        )}
      </div>
    </div>
  )
}
