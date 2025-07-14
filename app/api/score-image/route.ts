import { NextResponse } from "next/server"
import { generateText } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
  try {
    const { imageUrl, metadata } = await req.json()

    if (!imageUrl || !metadata) {
      return NextResponse.json({ error: "Missing imageUrl or metadata" }, { status: 400 })
    }

    // Construct a detailed prompt for the AI to score the image
    const prompt = `Analyze the following image (described by its metadata) for its aesthetic quality, creativity, and technical execution.
    The image was generated with the following parameters:
    - Dataset: ${metadata.dataset}
    - Scenario: ${metadata.scenario}
    - Color Scheme: ${metadata.colorScheme}
    - Seed: ${metadata.seed}
    - Samples: ${metadata.samples}
    - Noise: ${metadata.noise}
    - Generation Mode: ${metadata.generationMode}
    ${metadata.aiPrompt ? `- AI Prompt: ${metadata.aiPrompt}` : ""}
    ${metadata.aiDescription ? `- AI Description: ${metadata.aiDescription}` : ""}

    Provide a score from 1.0 to 10.0 (e.g., 8.5) and a brief rating (e.g., "Excellent", "Good", "Average", "Needs Improvement").
    Focus on:
    1. **Visual Appeal**: How harmonious are the colors and shapes?
    2. **Originality**: How unique and creative is the composition?
    3. **Complexity/Detail**: How intricate are the patterns and textures?
    4. **Cohesion**: Do all elements work together effectively?

    Output your response as a JSON object with 'score' (number), 'rating' (string), and 'method' (string, always "AI Aesthetic Scoring").
    Example: {"score": 8.5, "rating": "Excellent", "method": "AI Aesthetic Scoring"}
    `

    const { text: aiResponse } = await generateText({
      model: openai("gpt-4o"),
      prompt: prompt,
      temperature: 0.7,
      maxTokens: 200, // Keep response concise
    })

    console.log("AI Scoring Response:", aiResponse)

    try {
      const parsedResponse = JSON.parse(aiResponse)
      if (typeof parsedResponse.score === "number" && typeof parsedResponse.rating === "string") {
        return NextResponse.json({
          score: parsedResponse.score,
          rating: parsedResponse.rating,
          method: parsedResponse.method || "AI Aesthetic Scoring",
        })
      } else {
        throw new Error("Invalid AI response format.")
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError)
      // Fallback if AI doesn't return perfect JSON
      const scoreMatch = aiResponse.match(/"score":\s*(\d+\.?\d*)/)
      const ratingMatch = aiResponse.match(/"rating":\s*"([^"]*)"/)
      const score = scoreMatch ? Number.parseFloat(scoreMatch[1]) : 5.0
      const rating = ratingMatch ? ratingMatch[1] : "Undetermined"
      return NextResponse.json({
        score: score,
        rating: rating,
        method: "AI Aesthetic Scoring (Parsed)",
      })
    }
  } catch (error: any) {
    console.error("Error scoring image with AI:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to score image: " + error.message }, { status: 500 })
  }
}
