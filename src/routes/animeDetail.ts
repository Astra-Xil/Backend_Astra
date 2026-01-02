// src/routes/anime.ts
import { Hono } from "hono"
import type { AnimeDetail } from "../types/api/anime_detail"
import type { AniListResponse } from "../types/api/response/anime_detail"
import { mapAnimeDetailToUI } from "../lib/transform/animeDetail"

const anime = new Hono()
const ENDPOINT = "https://graphql.anilist.co"

anime.get("/:malId", async (c) => {
  const malId = Number(c.req.param("malId"))
  if (Number.isNaN(malId)) {
    return c.json({ error: "invalid mal id" }, 400)
  }

  const query = `
    query ($malId: Int!) {
  Media(idMal: $malId, type: ANIME) {
    id
    idMal
    title { native }
    season
    seasonYear
    status
    episodes
    duration
    genres
    description
    siteUrl
    coverImage { large color }
    bannerImage
    trailer { site id thumbnail }
    studios(isMain: true) { nodes { name } }

    externalLinks {   # ← これを追加
      site
      url
      icon
    }
  }
}

  `

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Accept": "application/json",
    },
    body: JSON.stringify({ query, variables: { malId } }),
    cf: { cacheTtl: 3600 },
  } as any)

  if (!res.ok) {
    return c.json({ error: "AniList fetch failed" }, 500)
  }

  const json = (await res.json()) as AniListResponse

  if (json.errors) {
    return c.json({ error: "AniList GraphQL error" }, 502)
  }

  const m = json.data?.Media
  if (!m) {
    return c.json({ error: "not found" }, 404)
  }

  const apiData: AnimeDetail = {
    anilistId: m.id,
    malId: m.idMal ?? null,
    title: { native: m.title.native },

    season: m.season,
    seasonYear: m.seasonYear,
    status: m.status,
    episodes: m.episodes,
    duration: m.duration,

    genres: m.genres ?? [],
    studios: m.studios.nodes.map((s) => s.name),

    description: m.description,
    siteUrl: m.siteUrl,

    images: {
      cover: m.coverImage,
      banner: m.bannerImage,
    },

    trailer: m.trailer,

    // ✅ これを足すだけ
    externalLinks: m.externalLinks ?? [],
  }


  const uiData = mapAnimeDetailToUI(apiData)
  return c.json({ data: uiData })
})

export default anime
