import { Hono } from 'hono'

export const wallpaperRouter = new Hono()

const BING_API =
  'https://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=zh-CN'
const BING_BASE = 'https://www.bing.com'

interface BingResponse {
  images: Array<{
    url: string
    title: string
    copyright: string
    startdate: string
  }>
}

/**
 * GET /wallpaper/today
 * Returns the Bing daily wallpaper URL (4K UHD).
 * Acts as a CORS proxy so the browser can safely consume it.
 */
wallpaperRouter.get('/today', async (c) => {
  try {
    const res = await fetch(BING_API)
    if (!res.ok) {
      return c.json({ error: { code: 'BING_FETCH_FAILED', message: 'Failed to fetch Bing API' } }, 502)
    }

    const data = (await res.json()) as BingResponse
    const image = data?.images?.[0]
    if (!image?.url) {
      return c.json({ error: { code: 'BING_PARSE_FAILED', message: 'Unexpected Bing response shape' } }, 502)
    }

    // Replace resolution suffix with _UHD.jpg to get 4K image
    const uhdUrl = BING_BASE + image.url.replace(/(_\d+x\d+\.jpg)/, '_UHD.jpg')

    return c.json({
      url: uhdUrl,
      title: image.title,
      copyright: image.copyright,
      date: image.startdate, // format: YYYYMMDD
    })
  } catch (err) {
    console.error('[wallpaper] Error proxying Bing API:', err)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Proxy request failed' } }, 500)
  }
})
