import { Hono } from "hono"

/* ---------------------------
 * 型定義
 * -------------------------- */

type JikanAnime = {
  mal_id: number
  title: string
  title_japanese?: string
  images: {
    jpg: {
      large_image_url: string
    }
  }
}

type JikanListResponse = {
  data: JikanAnime[]
}

/* ---------------------------
 * 設定（ここだけ触ればOK）
 * -------------------------- */

const SOURCES = [
  {
    id: "recommend",
    title: "おすすめアニメ",
    url: "https://api.jikan.moe/v4/top/anime?limit=10"
  },
  {
    id: "season",
    title: "今季のアニメ",
    url: "https://api.jikan.moe/v4/seasons/now?limit=10"
  },
  {
    id: "winter2026",
    title: "2026年冬アニメ",
    url: "https://api.jikan.moe/v4/seasons/2026/winter?limit=10"
  }
]

/* ---------------------------
 * Hono app
 * -------------------------- */

const home = new Hono()

home.get("/", async (c) => {
  const cache = (globalThis as any).caches.default
  const cacheKey = new Request(c.req.url)

  // ① cache
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  let responses: Response[]

  // ② fetch
  try {
    responses = await Promise.all(
      SOURCES.map(s => fetch(s.url))
    )
  } catch (err) {
    console.error("Jikan fetch error:", err)
    return c.json({ error: "Jikan fetch error" }, 503)
  }

  // ③ rate limit
  const rateLimited = responses.find(r => r.status === 429)
  if (rateLimited) {
    const retryAfter = Number(rateLimited.headers.get("Retry-After") ?? "3")
    return c.json({ error: "rate limited", retryAfter }, 429)
  }

  // ④ http error
  const failed = responses.find(r => !r.ok)
  if (failed) {
    const text = await failed.text()
    console.error("Jikan failed", { status: failed.status, body: text })
    return c.json({ error: "Jikan fetch failed" }, 502)
  }

  // ⑤ json parse（unknown回避）
  const jsons = await Promise.all(
    responses.map(r => r.json() as Promise<JikanListResponse>)
  )

  // ⑥ build sections
  const sections = SOURCES.map((s, i) => {
    const list = jsons[i]?.data ?? []

    return {
      id: s.id,
      title: s.title,
      items: list.map(a => ({
        id: a.mal_id,
        title: a.title_japanese ?? a.title,
        image: a.images.jpg.large_image_url
      }))
    }
  })

  const response = c.json({ sections })

  // ⑦ cache success only
  await cache.put(cacheKey, response.clone())

  return response
})

export default home
