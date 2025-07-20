import { type NextRequest, NextResponse } from "next/server"
import { generateFlowField } from "@/lib/flow-model"

export async function POST(request: NextRequest) {
  try {
    const params = await request.json()

    // Generate SVG flow field
    const svgContent = generateFlowField(params)

    return NextResponse.json({
      svgContent,
      success: true,
    })
  } catch (error: any) {
    console.error("Flow field generation error:", error)
    return NextResponse.json({ error: "Failed to generate flow field", details: error.message }, { status: 500 })
  }
}
