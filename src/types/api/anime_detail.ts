// types/api/jikan_anime_response.ts
export type JikanAnimeResponse = {
  data: {
    mal_id: number
    url: string

    title: string
    episodes: number | null
    status: string | null
    duration: string | null
    season: string | null
    year: number | null

    synopsis: string | null

    images: {
      jpg?: {
        large_image_url?: string
      }
    }

    trailer?: {
      youtube_id?: string | null
    }

    genres?: { name: string }[]
    studios?: { name: string }[]

    external?: { name: string; url: string }[]
    streaming?: { name: string; url: string }[]
  }
}
