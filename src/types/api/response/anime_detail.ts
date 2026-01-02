// // types/api/anilist_response.ts
// export type AniListResponse = {
//   data?: {
//     Media?: {
//       id: number
//       idMal: number | null
//       title: { native: string | null }
//       season: string | null
//       seasonYear: number | null
//       status: string | null
//       episodes: number | null
//       duration: number | null
//       genres: string[] | null
//       description: string | null
//       siteUrl: string | null
//       coverImage: { large: string | null; color: string | null } | null
//       bannerImage: string | null
//       trailer: { site: string | null; id: string | null; thumbnail: string | null } | null
//       studios: { nodes: { name: string }[] }

//       externalLinks?: {           // ← 追加
//         site: string
//         url: string
//         icon: string | null
//       }[] | null
//     }
//   }
//   errors?: unknown
// }
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
