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
        externalLinks {
          site
          url
          icon
        }
      }
    }
  `

  let res: Response

  try {
    res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        // ★ UA必須（AniList対策）
        "User-Agent": "astra/1.0 (contact: you@example.com)",
      },
      body: JSON.stringify({
        query,
        variables: { malId },
      }),
    } as any)
  } catch (err) {
    console.error("AniList fetch threw:", err)
    return c.json({ error: "AniList fetch error" }, 503)
  }

  // ★ HTTPレベル失敗の詳細ログ
  if (!res.ok) {
    const text = await res.text()
    console.error("AniList fetch failed", {
      status: res.status,
      statusText: res.statusText,
      body: text,
    })
    return c.json(
      { error: "AniList fetch failed", status: res.status },
      502
    )
  }

  const json = (await res.json()) as AniListResponse

  // ★ GraphQL error は 200 で来る
  if (json.errors) {
    console.error("AniList GraphQL errors:", json.errors)
    return c.json({ error: "AniList GraphQL error" }, 502)
  }

  const m = json.data?.Media
  if (!m) {
    return c.json({ error: "not found" }, 404)
  }

  // ★ null安全に APIモデル作成
  const apiData: AnimeDetail = {
    anilistId: m.id,
    malId: m.idMal ?? null,
    title: { native: m.title.native },

    season: m.season ?? null,
    seasonYear: m.seasonYear ?? null,
    status: m.status ?? null,
    episodes: m.episodes ?? null,
    duration: m.duration ?? null,

    genres: m.genres ?? [],
    studios: m.studios?.nodes?.map((s) => s.name) ?? [],

    description: m.description ?? null,
    siteUrl: m.siteUrl ?? null,

    images: {
      cover: m.coverImage ?? null,
      banner: m.bannerImage ?? null,
    },

    trailer: m.trailer ?? null,
    externalLinks: m.externalLinks ?? [],
  }

  const uiData = mapAnimeDetailToUI(apiData)

  // ★ 成功時だけキャッシュ（任意）
  c.header("Cache-Control", "public, max-age=3600")

  return c.json({ data: uiData })
})

export default anime
