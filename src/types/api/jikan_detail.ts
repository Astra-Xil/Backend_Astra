export type JikanAnimeDetail = {
  mal_id: number;
  title: string;
  title_japanese?: string | null;
  title_english?: string | null;
  images?: {
    jpg?: {
      image_url?: string;
      large_image_url?: string;
    };
    webp?: {
      image_url?: string;
      large_image_url?: string;
    };
  };
  trailer?: {
    url?: string | null;
    youtube_id?: string | null;
    embed_url?: string | null;
  } | null;
  score?: number | null;
  episodes?: number | null;
  status?: string | null;
  genres?: {
    name: string;
  }[];
  studios?: {
    name: string;
  }[];
  year?: number | null;
  duration?: string | null;
  synopsis?: string | null;
};
