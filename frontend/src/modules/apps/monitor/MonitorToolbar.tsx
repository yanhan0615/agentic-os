import { useCallback, useEffect, useRef, useState } from 'react'
import { useMonitorStore } from '../../../stores/monitorStore'

// ─── MonitorToolbar ───────────────────────────────────────────────────────────

export function MonitorToolbar() {
  const { isLoading, autoRefresh, lastFetchedAt, fetchSessions, setAutoRefresh, setSearchQuery } =
    useMonitorStore()

  const [localQuery, setLocalQuery] = useState('')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Debounce search input (300ms)
  const handleSearch = useCallback((q: string) => {
    setLocalQuery(q)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => setSearchQuery(q), 300)
  }, [setSearchQuery])

  // Cleanup debounce on unmount
  useEffect(() => () => { if (debounceRef.current) clearTimeout(debounceRef.current) }, [])

  const lastFetchStr = lastFetchedAt
    ? new Date(lastFetchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : null

  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-white/10 flex-shrink-0">
      {/* Search input */}
      <div className="flex-1 relative">
        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/30 text-xs select-none">⌕</span>
        <input
          type="text"
          value={localQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search agents…"
          className="w-full bg-white/5 rounded-lg pl-7 pr-3 py-1.5 text-xs text-white
            placeholder:text-white/30 border border-white/10 focus:outline-none focus:border-white/30
            transition-colors"
        />
      </div>

      {/* Auto-refresh toggle */}
      <label className="flex items-center gap-1.5 cursor-pointer select-none shrink-0">
        <div
          className={`relative w-8 h-4 rounded-full transition-colors ${
            autoRefresh ? 'bg-green-500/70' : 'bg-white/20'
          }`}
          onClick={() => setAutoRefresh(!autoRefresh)}
        >
          <span
            className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow transition-transform ${
              autoRefresh ? 'translate-x-4' : 'translate-x-0.5'
            }`}
          />
        </div>
        <span className="text-xs text-white/50">Live</span>
      </label>

      {/* Manual refresh button */}
      <button
        onClick={() => fetchSessions()}
        disabled={isLoading}
        title="Refresh now"
        className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10
          flex items-center justify-center text-white/60 hover:text-white/90
          transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
          <path d="M21 3v5h-5" />
        </svg>
      </button>

      {/* Last fetch time */}
      {lastFetchStr && (
        <span className="shrink-0 text-[10px] text-white/25 font-mono hidden sm:block">
          {lastFetchStr}
        </span>
      )}
    </div>
  )
}
