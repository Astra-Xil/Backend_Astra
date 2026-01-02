// src/types/ui/anime_detail_ui.ts
export type AnimeDetailUI = {
  id: number
  title: string

  hero: {
    episodesText?: string
    statusText?: string
  }

  meta: {
    seasonYear?: number
    season?: string
    genres?: string[]
    studios?: string[]
    durationText?: string
  }

  images: {
    coverLarge?: string
    coverColor?: string
    banner?: string
  }

  synopsis?: string

  trailer?: {
    youtubeId: string
    url: string
  }

  siteUrl?: string

  externalLinks?: {              // ← 追加
    site: string
    url: string
    icon?: string
  }[]
}
