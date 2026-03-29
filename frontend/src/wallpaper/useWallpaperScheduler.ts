import { useEffect, useRef } from 'react'
import { useWallpaperStore } from './wallpaperStore'

const POLL_INTERVAL_MS = 60_000 // check every 60s

/**
 * Mounts a daily wallpaper scheduler on the component lifecycle.
 *
 * - Triggers an immediate fetch on mount (uses cache if available)
 * - Polls every 60s; if the calendar date has advanced, re-fetches
 * - Cleans up the interval on unmount
 */
export function useWallpaperScheduler(): void {
  const fetchWallpaper = useWallpaperStore((s) => s.fetchWallpaper)
  const lastDateRef = useRef<string>('')

  useEffect(() => {
    // Immediate check on mount
    fetchWallpaper()
    lastDateRef.current = new Date().toISOString().slice(0, 10)

    const intervalId = setInterval(() => {
      const today = new Date().toISOString().slice(0, 10)
      if (today !== lastDateRef.current) {
        lastDateRef.current = today
        fetchWallpaper()
      }
    }, POLL_INTERVAL_MS)

    return () => clearInterval(intervalId)
  }, [fetchWallpaper])
}
