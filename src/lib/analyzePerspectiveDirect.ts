type PerspectiveScore = {
  summaryScore?: {
    value?: number
  }
}

export type PerspectiveResponse = {
  attributeScores?: {
    TOXICITY?: PerspectiveScore
    INSULT?: PerspectiveScore
    PROFANITY?: PerspectiveScore
  }
}



export async function analyzePerspectiveDirect(
  text: string,
  signal: AbortSignal
): Promise<PerspectiveResponse> {
  const apiKey = process.env.PERSPECTIVE_API_KEY;

  if (!apiKey) {
    console.error("PERSPECTIVE_API_KEY is missing");
    throw new Error("Perspective API key missing");
  }

  const url = `https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze?key=${apiKey}`;

  const body = {
    comment: { text },
    languages: ["ja"],
    requestedAttributes: {
      TOXICITY: {},
      INSULT: {},
      PROFANITY: {},
    },
    doNotStore: true,
  };

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  // ★ここが超重要（今の 500 の原因はこれ）
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Perspective API Error:", res.status, errorText);
    throw new Error("Perspective API request failed");
  }

  return res.json() as Promise<PerspectiveResponse>;
}
