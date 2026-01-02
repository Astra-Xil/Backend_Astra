// types/api/anime_detail.ts
export type AnimeDetail = {
  anilistId: number
  malId: number | null
  title: { native: string | null }

  season: string | null
  seasonYear: number | null
  status: string | null
  episodes: number | null
  duration: number | null

  genres: string[]
  studios: string[]

  description: string | null
  siteUrl: string | null

  images: {
    cover: { large: string | null; color: string | null } | null
    banner: string | null
  }

  trailer: { site: string | null; id: string | null; thumbnail: string | null } | null

  externalLinks: {               // ← 追加
    site: string
    url: string
    icon: string | null
  }[]
}
