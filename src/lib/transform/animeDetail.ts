// src/lib/transform/animeDetail.ts
import type { AnimeDetail } from "../../types/api/anime_detail"
import type { AnimeDetailUI } from "../../types/ui/anime_detail"

export function mapAnimeDetailToUI(api: AnimeDetail): AnimeDetailUI {
  const seasonText =
    api.seasonYear && api.season
      ? `${api.seasonYear} ${api.season}`
      : undefined

  return {
    id: api.malId ?? api.anilistId,

    title: api.title.native ?? "",

    hero: {
      episodesText:
        api.episodes != null ? `${api.episodes}話` : undefined,
      statusText: api.status ?? undefined,
    },

    meta: {
      seasonText,
      genresText:
        api.genres.length > 0 ? api.genres.join(" / ") : undefined,
      studiosText:
        api.studios.length > 0 ? api.studios.join(" / ") : undefined,
      durationText:
        api.duration != null ? `${api.duration}分` : undefined,
    },

    images: {
      coverLarge: api.images.cover?.large ?? undefined,
      coverColor: api.images.cover?.color ?? undefined,
      banner: api.images.banner ?? undefined,
    },

    synopsis:
      api.description && api.description.length > 0
        ? api.description
        : undefined,

    trailer:
      api.trailer?.site === "youtube" && api.trailer.id
        ? {
            youtubeId: api.trailer.id,
            url: `https://www.youtube.com/watch?v=${api.trailer.id}`,
          }
        : undefined,

    siteUrl: api.siteUrl ?? undefined,

   externalLinks: api.externalLinks.length
  ? api.externalLinks.map((l) => ({
      site: l.site,
      url: l.url,
      icon: l.icon ?? undefined, // ← ここが答え
    }))
  : undefined,
  }
}
