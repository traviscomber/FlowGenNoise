import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt } = await req.json()

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Always return a placeholder for now to avoid API issues
    const placeholderResponse = {
      imageUrl: "/placeholder.svg?height=1024&width=1024&text=Generated+Art",
      altText: prompt,
      placeholder: true,
    }

    console.log("Generating art for prompt:", prompt)
    return NextResponse.json(placeholderResponse)
  } catch (err) {
    console.error("❌ generate-ai-art route error:", err)
    return NextResponse.json(
      {
        error: "Failed to generate art",
        imageUrl: "/placeholder.svg?height=1024&width=1024&text=Error",
        altText: "Error generating art",
      },
      { status: 500 },
    )
  }
}
