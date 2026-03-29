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

/**
 * GET /wallpaper/picsum?date=YYYY-MM-DD
 *
 * Server-side proxy for Picsum Photos. Fetches the image bytes on the
 * server and re-streams them to the client, adding the necessary CORS
 * and cache headers. This sidesteps Picsum's missing
 * Access-Control-Allow-Origin header which would otherwise block
 * browser-side fetches.
 */
wallpaperRouter.get('/picsum', async (c) => {
  const date = c.req.query('date')
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return c.json({ error: { code: 'BAD_REQUEST', message: 'date query param required (YYYY-MM-DD)' } }, 400)
  }

  // Derive a numeric seed from the date for day-stable randomness
  const seed = date.replace(/-/g, '')
  const picsumUrl = `https://picsum.photos/seed/${seed}/3840/2160`

  try {
    const upstream = await fetch(picsumUrl)
    if (!upstream.ok) {
      return c.json({ error: { code: 'PICSUM_FETCH_FAILED', message: 'Upstream Picsum request failed' } }, 502)
    }

    const imageBuffer = await upstream.arrayBuffer()

    return new Response(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/jpeg',
        'Cache-Control': 'public, max-age=86400',
        'Access-Control-Allow-Origin': '*',
      },
    })
  } catch (err) {
    console.error('[wallpaper] Error proxying Picsum:', err)
    return c.json({ error: { code: 'INTERNAL_ERROR', message: 'Proxy request failed' } }, 502)
  }
})
