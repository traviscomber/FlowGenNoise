import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const settings = await request.json()

    // Generate SVG-based mathematical art
    const svg = generateMathematicalArt(settings)

    return NextResponse.json({
      imageUrl: `data:image/svg+xml;base64,${Buffer.from(svg).toString("base64")}`,
      format: "svg",
    })
  } catch (error) {
    console.error("Error generating art:", error)
    return NextResponse.json({ error: "Failed to generate art" }, { status: 500 })
  }
}

function generateMathematicalArt(settings: any): string {
  const { dataset, scenario, colorScheme, seed, samples, noise } = settings

  // Simple mathematical art generation
  const width = 400
  const height = 400
  const centerX = width / 2
  const centerY = height / 2

  let paths = ""
  const random = seedRandom(seed)

  for (let i = 0; i < samples; i++) {
    const angle = (i / samples) * Math.PI * 2
    const radius = 50 + random() * 100
    const x = centerX + Math.cos(angle) * radius
    const y = centerY + Math.sin(angle) * radius

    paths += `<circle cx="${x}" cy="${y}" r="${2 + random() * 3}" fill="${getColor(colorScheme, i, samples)}" opacity="0.7"/>`
  }

  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="100%" height="100%" fill="#f8f9fa"/>
    ${paths}
  </svg>`
}

function seedRandom(seed: number) {
  let x = Math.sin(seed) * 10000
  return () => {
    x = Math.sin(x) * 10000
    return x - Math.floor(x)
  }
}

function getColor(scheme: string, index: number, total: number): string {
  const hue = (index / total) * 360
  switch (scheme) {
    case "warm":
      return `hsl(${(hue % 60) + 300}, 70%, 60%)`
    case "cool":
      return `hsl(${(hue % 120) + 180}, 70%, 60%)`
    case "monochrome":
      return `hsl(0, 0%, ${20 + (index / total) * 60}%)`
    default:
      return `hsl(${hue}, 70%, 60%)`
  }
}
