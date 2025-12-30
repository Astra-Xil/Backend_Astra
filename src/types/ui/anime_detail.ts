export type AnimeDetailUI = {
  id: number;
  title: string;
  titleSub?: string;
  imageUrl: string;
  imagePreviewUrl: string;
  hero: {
    scoreText: string;
    episodesText: string;
    statusLabel: string;
  };
  meta: {
    genres: string[];
    studios: string[];
    yearText: string;
    durationText: string;
  };
  synopsis: string;
  trailer: {
    url: string;
    youtubeId: string;
  };
};
