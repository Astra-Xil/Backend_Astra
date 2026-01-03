import { Hono } from "hono";
import type { AnimeSearchResponseAPI } from "../types/api/anime_search";
import type { AnimeSearchUI } from "../types/ui/anime_search";

const app = new Hono();

app.get("/", async (c) => {
  const qParam = c.req.query("q") ?? "";
  const q = qParam.length > 50 ? qParam.slice(0, 50) : qParam;

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime?q=${encodeURIComponent(q)}&sfw=true&order_by=members&limit=20`,
      {
        cf: { cacheTtl: 60 },
      } as RequestInit & { cf?: { cacheTtl?: number } }
    );

    if (!res.ok) {
      return c.json(
        { error: "Failed to fetch from Jikan" },
        res.status as 400
      );
    }

    const json = (await res.json()) as AnimeSearchResponseAPI;

    const slim: AnimeSearchUI[] = json.data.map((item) => ({
      id: item.mal_id,
      title: item.title_japanese || item.title,
      imageUrl:
        item.images?.webp?.image_url ??
        item.images?.jpg?.image_url ??
        "",
      episodes: item.episodes ?? null,
      genres: item.genres?.map((g) => g.name) ?? [],
    }));

    return c.json({ data: slim });

  } catch {
    return c.json(
      { error: "Server error fetching Jikan API" },
      500
    );
  }
});

export default app;
