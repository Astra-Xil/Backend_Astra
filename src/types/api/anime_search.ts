export type AnimeSearchItemAPI = {
  mal_id: number;
  title: string;
  title_japanese?: string | null;
  images?: {
    jpg?: {
      image_url?: string;
    };
    webp?: {
      image_url?: string;
    };
  };
  episodes?: number | null;
  genres?: {
    name: string;
  }[];
};

export type AnimeSearchResponseAPI = {
  data: AnimeSearchItemAPI[];
};
