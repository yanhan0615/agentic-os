/**
 * wallpaperService — handles fetching the daily wallpaper URL with fallback chain.
 *
 * Fallback chain:
 *   1. Backend proxy → Bing daily wallpaper (4K UHD)
 *   2. Backend proxy → Picsum Photos (CORS-safe, seeded by date)
 *   3. null (caller handles graceful degradation to CSS gradient)
 *
 * All image fetches go through the backend to avoid CORS restrictions.
 * Picsum does not set Access-Control-Allow-Origin on direct image responses.
 */

const API_BASE = '/agentic-os/api/wallpaper'

interface BingProxyResponse {
  url: string
  title?: string
  copyright?: string
  date?: string
}

/**
 * Fetch today's wallpaper URL.
 * Returns null only if ALL fallbacks fail.
 */
export async function getWallpaperUrl(todayDate: string): Promise<string | null> {
  // 1. Try Bing via backend proxy — returns a JSON with the image URL
  try {
    const res = await fetch(`${API_BASE}/today`)
    if (res.ok) {
      const data = (await res.json()) as BingProxyResponse
      if (data?.url) return data.url
    }
  } catch {
    // Network error or backend down — fall through
  }

  // 2. Picsum via backend proxy — backend streams the image, no CORS issue
  // Return the proxy URL directly; the browser fetches it as a same-origin request.
  return `${API_BASE}/picsum?date=${todayDate}`
}
