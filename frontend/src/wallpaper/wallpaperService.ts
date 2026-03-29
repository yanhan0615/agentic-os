/**
 * wallpaperService — handles fetching the daily wallpaper URL with fallback chain.
 *
 * Fallback chain:
 *   1. Backend proxy → Bing daily wallpaper (4K UHD)
 *   2. Picsum Photos (seeded by date, consistent per day)
 *   3. null (caller handles graceful degradation)
 */

const WALLPAPER_API = '/agentic-os/api/wallpaper/today'

interface BingProxyResponse {
  url: string
  title?: string
  copyright?: string
  date?: string
}

/** Returns a stable Picsum URL for a given date string (YYYY-MM-DD) */
function getPicsumUrl(date: string): string {
  // Derive a numeric seed from the date for day-stable randomness
  const seed = date.replace(/-/g, '')
  return `https://picsum.photos/seed/${seed}/3840/2160`
}

/**
 * Fetch today's wallpaper URL.
 * Returns null only if ALL fallbacks fail.
 */
export async function getWallpaperUrl(todayDate: string): Promise<string | null> {
  // 1. Try backend proxy (Bing)
  try {
    const res = await fetch(WALLPAPER_API)
    if (res.ok) {
      const data = (await res.json()) as BingProxyResponse
      if (data?.url) return data.url
    }
  } catch {
    // Network error or backend down — fall through
  }

  // 2. Try Picsum (directly accessible, CORS-friendly)
  try {
    const picsumUrl = getPicsumUrl(todayDate)
    // Verify the URL is reachable with a HEAD request
    const probe = await fetch(picsumUrl, { method: 'HEAD' })
    if (probe.ok) return picsumUrl
  } catch {
    // Fall through
  }

  // 3. All sources failed
  return null
}
