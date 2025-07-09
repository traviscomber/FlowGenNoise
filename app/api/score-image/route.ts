import { NextResponse } from "next/server"

/**
 * POST /api/score-image
 * Body: { imageUrl: string; metadata?: any }
 *
 * 1. Attempts to score the image with Replicate's AestheticPredictor.
 * 2. On any failure (missing token, API error, etc.) falls back to a local heuristic.
 */
export async function POST(req: Request) {
  // ────────────────────────────────────────────────────────────
  // Parse body ONCE so we can re-use it for both paths
  // ────────────────────────────────────────────────────────────
  let body: { imageUrl?: string; metadata?: any }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 })
  }

  const { imageUrl, metadata } = body

  if (!imageUrl) {
    return NextResponse.json({ error: "Image URL is required" }, { status: 400 })
  }

  // ────────────────────────────────────────────────────────────
  // Try Replicate first (only if token + model version are set)
  // ────────────────────────────────────────────────────────────
  const token = process.env.REPLICATE_API_TOKEN
  const modelVersion =
    process.env.REPLICATE_MODEL_VERSION ??
    // Default public version of "aesthetic-predictor"
    "48227b6d39d3c8c8c9d17ad9b93d15d64ba5f9d6e0a4b5eaf311ec5f7c23e38e"

  if (token) {
    try {
      const prediction = await createReplicatePrediction(token, modelVersion, imageUrl)
      const aestheticScore = await pollReplicatePrediction(token, prediction.id)

      return NextResponse.json({
        score: aestheticScore,
        rating: getAestheticRating(aestheticScore),
        method: "replicate",
      })
    } catch (replicateErr) {
      // Log for observability but keep going
      console.error("Replicate aesthetic scoring failed, falling back →", replicateErr)
    }
  }

  // ────────────────────────────────────────────────────────────
  // Local fallback
  // ────────────────────────────────────────────────────────────
  const local = await getLocalAestheticScore({ imageUrl, metadata })
  return NextResponse.json(local)
}

/* ────────────────────────────────────────────────────────── */
/* Helpers                                                   */
/* ────────────────────────────────────────────────────────── */

async function createReplicatePrediction(token: string, version: string, image: string) {
  const res = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version,
      input: { image },
    }),
  })

  if (!res.ok) {
    const detail = await safeReadText(res)
    throw new Error(`Replicate API error (${res.status}): ${detail}`)
  }
  return res.json() as Promise<{ id: string }>
}

async function pollReplicatePrediction(token: string, id: string): Promise<number> {
  const poll = async () => {
    const r = await fetch(`https://api.replicate.com/v1/predictions/${id}`, {
      headers: { Authorization: `Token ${token}` },
      cache: "no-store",
    })
    if (!r.ok) throw new Error(`Polling failed (${r.status})`)
    return r.json() as Promise<{ status: string; output: number }>
  }

  for (;;) {
    const data = await poll()
    if (data.status === "succeeded") return data.output
    if (data.status === "failed" || data.status === "canceled") {
      throw new Error(`Prediction ${data.status}`)
    }
    await new Promise((res) => setTimeout(res, 1100))
  }
}

function getAestheticRating(score: number): string {
  if (score >= 8) return "Exceptional"
  if (score >= 7) return "Excellent"
  if (score >= 6) return "Very Good"
  if (score >= 5) return "Good"
  if (score >= 4) return "Fair"
  return "Needs Improvement"
}

/**
 * Lightweight local heuristic when Replicate isn’t available.
 */
async function getLocalAestheticScore({
  imageUrl,
  metadata,
}: {
  imageUrl: string
  metadata?: any
}): Promise<{ score: number; rating: string; method: string }> {
  let score = 5 // start neutral

  try {
    // Fetch once to get size - good signal for detail/complexity
    const resp = await fetch(imageUrl, { cache: "no-store" })
    const buffer = await resp.arrayBuffer()
    const size = buffer.byteLength

    // Size bonus
    if (size > 500_000) score += 0.4
    if (size > 1_000_000) score += 0.4

    // Generation params
    if (metadata) {
      if (metadata.samples > 1000) score += 0.6
      if (metadata.noise >= 0.02 && metadata.noise <= 0.08) score += 0.4
      if (metadata.generationMode === "ai") score += 0.6
      if (metadata.scenario && metadata.scenario !== "none") score += 0.5
    }

    // Mild randomness for variety
    score += (Math.random() - 0.5) * 0.6
  } catch {
    // ignore fetch failures – keep base score + randomness
    score += (Math.random() - 0.5) * 1
  }

  score = Math.max(1, Math.min(10, score))
  return {
    score: Number(score.toFixed(1)),
    rating: getAestheticRating(score),
    method: "local",
  }
}

async function safeReadText(res: Response) {
  try {
    return await res.text()
  } catch {
    return "(no body)"
  }
}
