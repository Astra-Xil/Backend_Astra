import { Hono } from "hono";
import type { JikanAnimeDetail } from "../types/api/jikan_detail";
import { toAnimeDetailUI } from "../lib/transform/animeDetail";

const app = new Hono();

app.get("/:id", async (c) => {
  const id = c.req.param("id");

  try {
    const res = await fetch(
      `https://api.jikan.moe/v4/anime/${id}/full`,
      {
        cf: { cacheTtl: 3600 },
      } as RequestInit & { cf?: { cacheTtl?: number } }
    );

    if (!res.ok) {
      return c.json(
        { error: "Failed to fetch Jikan" },
        res.status as 400
      );
    }

    const json = (await res.json()) as { data: JikanAnimeDetail };

    return c.json({
      data: toAnimeDetailUI(json.data),
    });
  } catch {
    return c.json(
      { error: "Server error" },
      500
    );
  }
});

export default app;
