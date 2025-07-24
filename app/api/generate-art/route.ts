import { NextResponse } from "next/server"
import { DATASETS, COLOR_SCHEMES, SCENARIOS } from "@/lib/flow-model"
import { generateFlowFieldPoints } from "@/lib/plot-utils"

export async function POST(req: Request) {
  try {
    const { datasetName, colorSchemeName, scenarioName, numParticles, particleSpeed, lineLength, params } =
      await req.json()

    const selectedDataset = DATASETS.find((d) => d.name === datasetName)
    const selectedColorScheme = COLOR_SCHEMES.find((c) => c.name === colorSchemeName)
    const selectedScenario = SCENARIOS.find((s) => s.name === scenarioName)

    if (!selectedDataset || !selectedColorScheme || !selectedScenario) {
      return NextResponse.json({ error: "Invalid selection" }, { status: 400 })
    }

    // Override default params with user-provided ones
    const finalParams = { ...selectedDataset.params, ...params }

    const points = generateFlowFieldPoints(
      selectedDataset.flow,
      selectedScenario.initialPosition,
      numParticles,
      particleSpeed,
      selectedScenario.noiseStrength,
      finalParams,
      selectedScenario.stereographic,
    )

    // In a real application, you would render these points to an image
    // using a server-side rendering library (e.g., Node-Canvas, headless Three.js)
    // and return the image data.
    // For this example, we'll just return a success message and the parameters.

    return NextResponse.json({
      message: "Art generation parameters received. Image generation would occur here.",
      data: {
        pointsCount: points.length,
        dataset: selectedDataset.name,
        colorScheme: selectedColorScheme.name,
        scenario: selectedScenario.name,
        finalParams,
      },
    })
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 })
  }
}
