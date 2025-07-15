export const runtime = "nodejs"

import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { parameters } = await request.json()

    // Simulate art generation with flow field parameters
    const artData = {
      id: Date.now().toString(),
      parameters,
      imageUrl: `/placeholder.svg?height=400&width=400&query=flow+field+art`,
      createdAt: new Date().toISOString(),
    }

    return NextResponse.json(artData)
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 })
  }
}

function generateDataset(datasetType: string, seed: number, numSamples: number, noise: number) {
  const data = []
  const random = (s: number) => {
    const x = Math.sin(s) * 10000
    return x - Math.floor(x)
  }

  for (let i = 0; i < numSamples; i++) {
    const t = (i / numSamples) * 2 * Math.PI
    let x = 0
    let y = 0

    switch (datasetType) {
      case "lissajous":
        x = Math.sin(2 * t + seed * 0.01) + noise * (random(i * 10 + seed) - 0.5)
        y = Math.cos(3 * t + seed * 0.01) + noise * (random(i * 20 + seed) - 0.5)
        break
      case "mandelbrot":
        x = Math.sin(t) * (1 + noise * (random(i * 10 + seed) - 0.5))
        y = Math.cos(t) * (1 + noise * (random(i * 20 + seed) - 0.5))
        break
      case "julia":
        x = Math.sin(t * 1.5) * (1 + noise * (random(i * 15 + seed) - 0.5))
        y = Math.cos(t * 2.5) * (1 + noise * (random(i * 25 + seed) - 0.5))
        break
      case "sierpinski":
        const p = random(i + seed)
        if (p < 0.33) {
          x = 0.5 * x
          y = 0.5 * y
        } else if (p < 0.66) {
          x = 0.5 * x + 0.5
          y = 0.5 * y
        } else {
          x = 0.5 * x + 0.25
          y = 0.5 * y + 0.5
        }
        x += noise * (random(i * 30 + seed) - 0.5)
        y += noise * (random(i * 40 + seed) - 0.5)
        break
      case "fern":
        const r = random(i + seed)
        let nextX = 0
        let nextY = 0
        if (r <= 0.01) {
          nextX = 0
          nextY = 0.16 * y
        } else if (r <= 0.86) {
          nextX = 0.85 * x + 0.04 * y
          nextY = -0.04 * x + 0.85 * y + 1.6
        } else if (r <= 0.93) {
          nextX = 0.2 * x - 0.26 * y
          nextY = 0.23 * x + 0.22 * y + 1.6
        } else {
          nextX = -0.15 * x + 0.28 * y
          nextY = 0.26 * x + 0.24 * y + 0.44
        }
        x = nextX + noise * (random(i * 50 + seed) - 0.5)
        y = nextY + noise * (random(i * 60 + seed) - 0.5)
        break
    }
    data.push({ x, y })
  }

  return data
}

function createSVGPlot(
  data: Array<{ x: number; y: number }>,
  colorScheme: string,
  width: number,
  height: number,
): string {
  const colors = getColorScheme(colorScheme)

  // Find data bounds
  const xValues = data.map((d) => d.x)
  const yValues = data.map((d) => d.y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)

  // Scale data to fit SVG viewport
  const margin = 50
  const plotWidth = width - 2 * margin
  const plotHeight = height - 2 * margin

  const scaleX = (x: number) => margin + ((x - xMin) / (xMax - xMin)) * plotWidth
  const scaleY = (y: number) => margin + ((yMax - y) / (yMax - yMin)) * plotHeight

  // Generate SVG points
  const points = data
    .map((d, i) => {
      const x = scaleX(d.x)
      const y = scaleY(d.y)
      const colorIndex = Math.floor((i / data.length) * colors.length)
      const color = colors[colorIndex]
      return `<circle cx="${x}" cy="${y}" r="1.5" fill="${color}" opacity="0.7"/>`
    })
    .join("")

  return `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#000"/>
      ${points}
    </svg>
  `
}

function getColorScheme(scheme: string): string[] {
  const schemes: Record<string, string[]> = {
    viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
    plasma: [
      "#0c0786",
      "#40039c",
      "#6a00a7",
      "#8f0da4",
      "#b12a90",
      "#cc4778",
      "#e16462",
      "#f2844b",
      "#fca636",
      "#fcce25",
    ],
    inferno: [
      "#000003",
      "#1b0c41",
      "#4a0c6b",
      "#781c6d",
      "#a52c60",
      "#cf4446",
      "#ed6925",
      "#fb9b06",
      "#f7d03c",
      "#f8765c",
      "#fd9969",
      "#fdbf6f",
      "#fcfdbf",
    ],
    magma: [
      "#000003",
      "#0b0927",
      "#231151",
      "#410f75",
      "#5f187f",
      "#7b2382",
      "#982d80",
      "#b73779",
      "#d3436e",
      "#eb5760",
      "#f8765c",
      "#fd9969",
      "#fdbf6f",
      "#fcfdbf",
    ],
    cividis: [
      "#00204c",
      "#00336f",
      "#39486b",
      "#575d6d",
      "#707173",
      "#8a8678",
      "#a69c75",
      "#c4b56c",
      "#e4cf5b",
      "#ffea46",
    ],
    rainbow: [
      "#ff0000",
      "#ff8000",
      "#ffff00",
      "#80ff00",
      "#00ff00",
      "#00ff80",
      "#00ffff",
      "#0080ff",
      "#0000ff",
      "#8000ff",
    ],
    grayscale: [
      "#000000",
      "#1a1a1a",
      "#333333",
      "#4d4d4d",
      "#666666",
      "#808080",
      "#999999",
      "#b3b3b3",
      "#cccccc",
      "#ffffff",
    ],
  }
  return schemes[scheme] || schemes.viridis
}
