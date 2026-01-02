// // src/routes/anime.ts
// import { Hono } from "hono"
// import type { AnimeDetail } from "../types/api/anime_detail"
// import type { AniListResponse } from "../types/api/response/anime_detail"
// import { mapAnimeDetailToUI } from "../lib/transform/animeDetail"

// const anime = new Hono()
// const ENDPOINT = "https://graphql.anilist.co"

// anime.get("/:malId", async (c) => {
//   const cache = (globalThis as any).caches.default
//   const cacheKey = new Request(c.req.url)

//   // ① cache check
//   const cached = await cache.match(cacheKey)
//   if (cached) {
//     return cached
//   }

//   // ② param validation
//   const malId = Number(c.req.param("malId"))
//   if (Number.isNaN(malId)) {
//     return c.json({ error: "invalid mal id" }, 400)
//   }

//   const query = `
//     query ($malId: Int!) {
//       Media(idMal: $malId, type: ANIME) {
//         id
//         idMal
//         title { native }
//         season
//         seasonYear
//         status
//         episodes
//         duration
//         genres
//         description
//         siteUrl
//         coverImage { large color }
//         bannerImage
//         trailer { site id thumbnail }
//         studios(isMain: true) { nodes { name } }
//         externalLinks {
//           site
//           url
//           icon
//         }
//       }
//     }
//   `

//   let res: Response

//   // ③ fetch
//   try {
//     res = await fetch(ENDPOINT, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Accept": "application/json",
//         "User-Agent": "astra/1.0 (contact: you@example.com)",
//       },
//       body: JSON.stringify({ query, variables: { malId } }),
//     } as any)
//   } catch (err) {
//     console.error("AniList fetch threw:", err)
//     return c.json({ error: "AniList fetch error" }, 503)
//   }

//   // ④ rate limit 最優先
//   if (res.status === 429) {
//     const retryAfter = Number(res.headers.get("Retry-After") ?? "60")
//     return c.json({ error: "rate limited", retryAfter }, 429)
//   }

//   // ⑤ HTTP error
//   if (!res.ok) {
//     const text = await res.text()
//     console.error("AniList fetch failed", {
//       status: res.status,
//       body: text,
//     })
//     return c.json({ error: "AniList fetch failed" }, 502)
//   }

//   const json = (await res.json()) as AniListResponse

//   // ⑥ GraphQL error
//   if (json.errors) {
//     console.error("AniList GraphQL errors:", json.errors)
//     return c.json({ error: "AniList GraphQL error" }, 502)
//   }

//   const m = json.data?.Media
//   if (!m) {
//     return c.json({ error: "not found" }, 404)
//   }

//   // ⑦ transform
//   const apiData: AnimeDetail = {
//     anilistId: m.id,
//     malId: m.idMal ?? null,
//     title: { native: m.title.native },

//     season: m.season ?? null,
//     seasonYear: m.seasonYear ?? null,
//     status: m.status ?? null,
//     episodes: m.episodes ?? null,
//     duration: m.duration ?? null,

//     genres: m.genres ?? [],
//     studios: m.studios?.nodes?.map((s) => s.name) ?? [],

//     description: m.description ?? null,
//     siteUrl: m.siteUrl ?? null,

//     images: {
//       cover: m.coverImage ?? null,
//       banner: m.bannerImage ?? null,
//     },

//     trailer: m.trailer ?? null,
//     externalLinks: m.externalLinks ?? [],
//   }

//   const uiData = mapAnimeDetailToUI(apiData)

//   // ⑧ success only cache
//   const response = c.json({ data: uiData })
//   await cache.put(cacheKey, response.clone())

//   return response
// })

// export default anime


// src/routes/anime.ts


import { Hono } from "hono"
import { mapAnimeDetailToUI } from "../lib/transform/animeDetail"
import type { JikanAnimeResponse } from "../types/api/anime_detail"
const anime = new Hono()
const ENDPOINT = "https://api.jikan.moe/v4/anime"

anime.get("/:malId", async (c) => {
  const cache = (globalThis as any).caches.default
  const cacheKey = new Request(c.req.url)

  // ① cache
  const cached = await cache.match(cacheKey)
  if (cached) return cached

  // ② param
  const malId = Number(c.req.param("malId"))
  if (Number.isNaN(malId)) {
    return c.json({ error: "invalid mal id" }, 400)
  }

  let res: Response

  // ③ fetch
  try {
    res = await fetch(`${ENDPOINT}/${malId}/full`)
  } catch (err) {
    console.error("Jikan fetch error:", err)
    return c.json({ error: "Jikan fetch error" }, 503)
  }

  // ④ rate limit
  if (res.status === 429) {
    const retryAfter = Number(res.headers.get("Retry-After") ?? "3")
    return c.json({ error: "rate limited", retryAfter }, 429)
  }

  // ⑤ http error
  if (!res.ok) {
    const text = await res.text()
    console.error("Jikan failed", { status: res.status, body: text })
    return c.json({ error: "Jikan fetch failed" }, 502)
  }

  const json = (await res.json()) as JikanAnimeResponse

  if (!json?.data) {
    return c.json({ error: "not found" }, 404)
  }

  // ⑥ transform（← ここが修正点）
  const uiData = mapAnimeDetailToUI(json)

  // ⑦ cache success only
  const response = c.json({ data: uiData })
  await cache.put(cacheKey, response.clone())

  return response
})

export default anime