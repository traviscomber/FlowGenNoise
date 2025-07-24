import { NextResponse } from "next/server"
import { generateFlowArtData } from "@/lib/flow-model"

export async function POST(request: Request) {
  try {
    const { parameters } = await request.json()

    if (!parameters) {
      return NextResponse.json({ error: "Parameters are required" }, { status: 400 })
    }

    // Generate the raw data (points and colors) for the flow art
    const data = generateFlowArtData(parameters)

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error("Error generating art data:", error)
    return NextResponse.json({ error: "Failed to generate art data" }, { status: 500 })
  }
}
