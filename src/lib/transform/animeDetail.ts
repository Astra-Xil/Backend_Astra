// // src/lib/transform/animeDetail.ts
// import type { AnimeDetail } from "../../types/api/anime_detail"
// import type { AnimeDetailUI } from "../../types/ui/anime_detail"

// export function mapAnimeDetailToUI(api: AnimeDetail): AnimeDetailUI {


//   return {
//     id: api.malId ?? api.anilistId,

//     title: api.title.native ?? "",

//     hero: {
//       episodesText:
//         api.episodes != null ? `${api.episodes}` : undefined,
//       statusText: api.status ?? undefined,
//     },

//     meta: {
//       seasonYear: api.seasonYear ?? undefined,
//       season: api.season ?? undefined,
//       genres: api.genres.length ? api.genres : undefined,
//       studios: api.studios.length ? api.studios : undefined,
//       durationText:
//         api.duration != null ? `${api.duration}分` : undefined,
//     },

//     images: {
//       coverLarge: api.images.cover?.large ?? undefined,
//       coverColor: api.images.cover?.color ?? undefined,
//       banner: api.images.banner ?? undefined,
//     },

//     synopsis:
//       api.description && api.description.length > 0
//         ? api.description
//         : undefined,

//     trailer:
//       api.trailer?.site === "youtube" && api.trailer.id
//         ? {
//             youtubeId: api.trailer.id,
//             url: `https://www.youtube.com/watch?v=${api.trailer.id}`,
//           }
//         : undefined,

//     siteUrl: api.siteUrl ?? undefined,

//    externalLinks: api.externalLinks.length
//   ? api.externalLinks.map((l) => ({
//       site: l.site,
//       url: l.url,
//       icon: l.icon ?? undefined, // ← ここが答え
//     }))
//   : undefined,
//   }
// }
// src/lib/transform/jikanAnimeDetail.ts


import type { AnimeDetailUI } from "../../types/ui/anime_detail"

import type { JikanAnimeResponse } from "../../types/api/anime_detail"

export function mapAnimeDetailToUI(
  res: JikanAnimeResponse
): AnimeDetailUI {
  const d = res.data

  return {
    id: d.mal_id,
    title: d.title,

    hero: {
      episodesText: d.episodes != null ? String(d.episodes) : undefined,
      statusText: d.status ?? undefined,
    },

    meta: {
      seasonYear: d.year ?? undefined,
      season: d.season ?? undefined,
      genres: d.genres?.map(g => g.name),
      studios: d.studios?.map(s => s.name),
      durationText: d.duration ?? undefined,
    },

    images: {
      coverLarge: d.images?.jpg?.large_image_url,
      coverColor: undefined,
      banner: undefined,
    },

    synopsis: d.synopsis ?? undefined,

    trailer: d.trailer?.youtube_id
      ? {
          youtubeId: d.trailer.youtube_id,
          url: `https://www.youtube.com/watch?v=${d.trailer.youtube_id}`,
        }
      : undefined,

    siteUrl: d.url,

    externalLinks: [
      ...(d.external ?? []).map(e => ({
        site: e.name,
        url: e.url,
      })),
      ...(d.streaming ?? []).map(s => ({
        site: s.name,
        url: s.url,
      })),
    ],
  }
}