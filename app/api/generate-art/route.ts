import { NextResponse } from "next/server"
import { generateDataset } from "@/lib/flow-model"
import { generateScatterPlotSVG } from "@/lib/plot-utils"

export async function POST(req: Request) {
  try {
    const { dataset, seed } = await req.json()

    if (!dataset || typeof seed === "undefined") {
      return NextResponse.json({ error: "Missing dataset or seed" }, { status: 400 })
    }

    const data = generateDataset(dataset, seed)
    const imageBase64 = generateScatterPlotSVG(data)

    return NextResponse.json({ image: imageBase64 })
  } catch (error) {
    console.error("Error generating flow art:", error)
    return NextResponse.json({ error: "Failed to generate flow art" }, { status: 500 })
  }
}
