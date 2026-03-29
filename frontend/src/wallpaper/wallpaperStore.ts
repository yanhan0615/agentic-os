import { create } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { getWallpaperUrl } from './wallpaperService'

/** ISO date string, e.g. "2026-03-29" */
function getTodayString(): string {
  return new Date().toISOString().slice(0, 10)
}

const CACHE_KEY_PREFIX = 'wallpaper:'
const CACHE_MAX_DAYS = 7

// ─── Cache helpers ────────────────────────────────────────────────────────────

interface CacheEntry {
  url: string
  fetchedAt: number // Unix ms
}

function readCache(date: string): string | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY_PREFIX + date)
    if (!raw) return null
    const entry: CacheEntry = JSON.parse(raw)
    return entry.url ?? null
  } catch {
    return null
  }
}

function writeCache(date: string, url: string): void {
  try {
    const entry: CacheEntry = { url, fetchedAt: Date.now() }
    localStorage.setItem(CACHE_KEY_PREFIX + date, JSON.stringify(entry))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

function pruneOldCache(): void {
  try {
    const cutoff = Date.now() - CACHE_MAX_DAYS * 24 * 60 * 60 * 1000
    const keysToDelete: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(CACHE_KEY_PREFIX)) continue
      try {
        const entry: CacheEntry = JSON.parse(localStorage.getItem(key) ?? '{}')
        if (entry.fetchedAt < cutoff) keysToDelete.push(key)
      } catch {
        keysToDelete.push(key!) // malformed entry — remove it
      }
    }
    keysToDelete.forEach((k) => localStorage.removeItem(k))
  } catch {
    // ignore
  }
}

// ─── Store ────────────────────────────────────────────────────────────────────

type WallpaperStatus = 'idle' | 'loading' | 'ready' | 'error'

interface WallpaperState {
  /** Currently active wallpaper URL, or null while loading / on error */
  url: string | null
  status: WallpaperStatus
  /** The date this wallpaper was fetched for ("YYYY-MM-DD") */
  currentDate: string
  fetchWallpaper: () => Promise<void>
}

export const useWallpaperStore = create<WallpaperState>()(
  immer((set, get) => ({
    url: null,
    status: 'idle',
    currentDate: '',

    fetchWallpaper: async () => {
      const today = getTodayString()

      // Skip if already fetched for today
      if (get().currentDate === today && get().status === 'ready') return

      // Cache hit
      const cached = readCache(today)
      if (cached) {
        set((s) => {
          s.url = cached
          s.status = 'ready'
          s.currentDate = today
        })
        return
      }

      // Cache miss — prune stale entries before fetching fresh data
      pruneOldCache()

      // Fetch from service
      set((s) => {
        s.status = 'loading'
      })

      const url = await getWallpaperUrl(today)

      if (url) {
        writeCache(today, url)
        set((s) => {
          s.url = url
          s.status = 'ready'
          s.currentDate = today
        })
      } else {
        set((s) => {
          s.status = 'error'
          // Keep previous url so the last successful wallpaper stays visible
        })
      }
    },
  })),
)
