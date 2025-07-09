import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const { dataset, seed, colorScheme, numSamples, noise } = await req.json()

    if (!dataset) {
      return NextResponse.json({ error: "Missing dataset parameter" }, { status: 400 })
    }

    // Create a detailed art prompt based on the dataset and parameters
    let artPrompt = ""

    switch (dataset) {
      case "spirals":
        artPrompt = `Abstract mathematical art featuring flowing spiral patterns, swirling vortexes, and curved lines that spiral outward from multiple centers. Use ${colorScheme} color palette with smooth gradients. The composition should feel dynamic and hypnotic with organic spiral formations.`
        break
      case "checkerboard":
        artPrompt = `Geometric abstract art with checkerboard-inspired patterns, alternating squares and rectangles in a grid formation. Use ${colorScheme} color scheme with sharp contrasts and clean geometric shapes. Modern, minimalist design with mathematical precision.`
        break
      case "moons":
        artPrompt = `Abstract crescent and circular forms, flowing moon-like shapes that curve and intersect. Use ${colorScheme} color palette with soft, glowing edges and celestial themes. Organic curves and lunar-inspired flowing forms.`
        break
      case "gaussian":
        artPrompt = `Soft, cloud-like abstract art with gaussian blur effects, smooth gradients radiating from central points. Use ${colorScheme} color scheme with organic, flowing forms that blend seamlessly. Dreamy, atmospheric composition with soft edges.`
        break
      case "grid":
        artPrompt = `Structured grid-based abstract art with intersecting lines, geometric patterns, and systematic arrangements. Use ${colorScheme} color palette with clean lines and mathematical precision. Modern geometric composition with grid-like structure.`
        break
      case "neural":
        artPrompt = `Neural network inspired abstract art featuring interconnected nodes, flowing connections between layers, and brain-like organic patterns. Use ${colorScheme} color scheme with glowing connections and synaptic pathways. Futuristic, technological aesthetic with organic flow.`
        break
      default:
        artPrompt = `Abstract mathematical art with flowing, organic patterns using ${colorScheme} color scheme.`
    }

    // Add noise and complexity based on parameters
    if (noise > 0.05) {
      artPrompt += " Add organic texture and natural randomness to the patterns."
    }
    if (numSamples > 1000) {
      artPrompt += " Highly detailed with intricate patterns and complex structures."
    }

    artPrompt += ` High quality digital art, 4K resolution, professional artistic style, smooth gradients, vibrant colors.`

    console.log("Generating AI art with prompt:", artPrompt)

    try {
      // Try to use DALL-E 3 for image generation
      const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: artPrompt,
          n: 1,
          size: "1792x1024",
          quality: "standard",
          response_format: "b64_json",
        }),
      })

      if (imageResponse.ok) {
        const imageData = await imageResponse.json()
        const base64Image = imageData.data[0].b64_json

        return NextResponse.json({
          image: `data:image/png;base64,${base64Image}`,
          description: artPrompt,
          parameters: { dataset, seed, colorScheme, numSamples, noise },
        })
      } else {
        console.log("DALL-E failed, falling back to procedural generation")
        throw new Error("DALL-E generation failed")
      }
    } catch (dalleError) {
      console.log("DALL-E not available, using enhanced procedural generation:", dalleError)

      // Fallback to enhanced procedural generation
      const proceduralImage = await generateProceduralArt(dataset, seed, colorScheme, numSamples, noise)

      return NextResponse.json({
        image: proceduralImage,
        description: `Procedural ${dataset} art with ${colorScheme} colors`,
        parameters: { dataset, seed, colorScheme, numSamples, noise },
      })
    }
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: "Failed to generate AI art" }, { status: 500 })
  }
}

// Enhanced procedural art generation as fallback
async function generateProceduralArt(
  dataset: string,
  seed: number,
  colorScheme: string,
  numSamples: number,
  noise: number,
): Promise<string> {
  const width = 1792
  const height = 1024

  // Create more sophisticated SVG art based on dataset
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`

  // Add gradient definitions
  svg += `<defs>`

  // Color schemes
  const colors = {
    magma: [
      "#000004",
      "#1b0c41",
      "#4a0c6b",
      "#781c6d",
      "#a52c60",
      "#cf4446",
      "#ed6925",
      "#fb9b06",
      "#f7d03c",
      "#fcffa4",
    ],
    viridis: ["#440154", "#482777", "#3f4a8a", "#31678e", "#26838f", "#1f9d8a", "#6cce5a", "#b6de2b", "#fee825"],
    plasma: ["#0d0887", "#5302a3", "#8b0aa5", "#b83289", "#db5c68", "#f48849", "#febd2a", "#f0f921"],
    cividis: [
      "#00224e",
      "#123570",
      "#3b496c",
      "#575d6d",
      "#707173",
      "#8a8678",
      "#a59c74",
      "#c3b369",
      "#e1cc55",
      "#fee838",
    ],
    grayscale: ["#000000", "#333333", "#666666", "#999999", "#cccccc", "#ffffff"],
  }

  const schemeColors = colors[colorScheme as keyof typeof colors] || colors.magma

  // Create gradients
  for (let i = 0; i < schemeColors.length - 1; i++) {
    svg += `<linearGradient id="grad${i}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${schemeColors[i]};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${schemeColors[i + 1]};stop-opacity:1" />
    </linearGradient>`
  }

  svg += `</defs>`

  // Background
  svg += `<rect width="${width}" height="${height}" fill="${schemeColors[0]}"/>`

  // Generate art based on dataset type
  const prng = createSeededRandom(seed)

  switch (dataset) {
    case "spirals":
      svg += generateSpiralArt(width, height, schemeColors, prng, numSamples, noise)
      break
    case "neural":
      svg += generateNeuralArt(width, height, schemeColors, prng, numSamples, noise)
      break
    case "moons":
      svg += generateMoonArt(width, height, schemeColors, prng, numSamples, noise)
      break
    case "checkerboard":
      svg += generateCheckerboardArt(width, height, schemeColors, prng, numSamples, noise)
      break
    case "gaussian":
      svg += generateGaussianArt(width, height, schemeColors, prng, numSamples, noise)
      break
    case "grid":
      svg += generateGridArt(width, height, schemeColors, prng, numSamples, noise)
      break
    default:
      svg += generateAbstractArt(width, height, schemeColors, prng, numSamples, noise)
  }

  svg += "</svg>"

  return "data:image/svg+xml;base64," + btoa(svg)
}

function createSeededRandom(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

function generateSpiralArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""
  const centerX = width / 2
  const centerY = height / 2

  for (let i = 0; i < samples / 10; i++) {
    const startAngle = prng() * Math.PI * 2
    const spiralTightness = 0.1 + prng() * 0.2
    const maxRadius = 200 + prng() * 300
    const color = colors[Math.floor(prng() * colors.length)]

    let path = `M ${centerX} ${centerY}`

    for (let t = 0; t < maxRadius; t += 5) {
      const angle = startAngle + t * spiralTightness
      const radius = t + (prng() - 0.5) * noise * 50
      const x = centerX + radius * Math.cos(angle)
      const y = centerY + radius * Math.sin(angle)
      path += ` L ${x} ${y}`
    }

    art += `<path d="${path}" stroke="${color}" stroke-width="${2 + prng() * 3}" fill="none" opacity="${0.3 + prng() * 0.4}"/>`
  }

  return art
}

function generateNeuralArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""
  const layers = 4
  const nodesPerLayer = Math.ceil(samples / layers / 10)

  // Generate nodes for each layer
  const nodes: Array<{ x: number; y: number; layer: number }> = []

  for (let layer = 0; layer < layers; layer++) {
    const layerX = (layer / (layers - 1)) * (width * 0.8) + width * 0.1

    for (let node = 0; node < nodesPerLayer; node++) {
      const nodeY = (node / Math.max(1, nodesPerLayer - 1)) * (height * 0.8) + height * 0.1
      const x = layerX + (prng() - 0.5) * noise * 100
      const y = nodeY + (prng() - 0.5) * noise * 100

      nodes.push({ x, y, layer })

      // Draw node
      const color = colors[Math.floor(prng() * colors.length)]
      const radius = 3 + prng() * 8
      art += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${0.6 + prng() * 0.4}"/>`
    }
  }

  // Generate connections between layers
  for (let i = 0; i < nodes.length; i++) {
    const node1 = nodes[i]
    for (let j = i + 1; j < nodes.length; j++) {
      const node2 = nodes[j]

      // Connect nodes from adjacent layers
      if (Math.abs(node1.layer - node2.layer) === 1 && prng() > 0.7) {
        const color = colors[Math.floor(prng() * colors.length)]
        art += `<line x1="${node1.x}" y1="${node1.y}" x2="${node2.x}" y2="${node2.y}" stroke="${color}" stroke-width="${1 + prng() * 2}" opacity="${0.2 + prng() * 0.3}"/>`
      }
    }
  }

  return art
}

function generateMoonArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""

  for (let i = 0; i < samples / 20; i++) {
    const centerX = prng() * width
    const centerY = prng() * height
    const radius = 20 + prng() * 100
    const color = colors[Math.floor(prng() * colors.length)]

    // Create crescent shapes
    const offsetX = (prng() - 0.5) * radius * 0.5
    const offsetY = (prng() - 0.5) * radius * 0.5

    art += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" opacity="${0.3 + prng() * 0.4}"/>`
    art += `<circle cx="${centerX + offsetX}" cy="${centerY + offsetY}" r="${radius * 0.8}" fill="${colors[0]}" opacity="${0.5 + prng() * 0.3}"/>`
  }

  return art
}

function generateCheckerboardArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""
  const gridSize = 20 + prng() * 40

  for (let x = 0; x < width; x += gridSize) {
    for (let y = 0; y < height; y += gridSize) {
      if (prng() > 0.5) {
        const color = colors[Math.floor(prng() * colors.length)]
        const size = gridSize + (prng() - 0.5) * noise * 20
        const offsetX = (prng() - 0.5) * noise * 10
        const offsetY = (prng() - 0.5) * noise * 10

        art += `<rect x="${x + offsetX}" y="${y + offsetY}" width="${size}" height="${size}" fill="${color}" opacity="${0.4 + prng() * 0.4}"/>`
      }
    }
  }

  return art
}

function generateGaussianArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""

  for (let i = 0; i < samples / 15; i++) {
    const centerX = width * 0.2 + prng() * width * 0.6
    const centerY = height * 0.2 + prng() * height * 0.6
    const radius = 30 + prng() * 150
    const color = colors[Math.floor(prng() * colors.length)]

    // Create gaussian-like blobs
    art += `<circle cx="${centerX}" cy="${centerY}" r="${radius}" fill="${color}" opacity="${0.1 + prng() * 0.3}"/>`
    art += `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.7}" fill="${color}" opacity="${0.1 + prng() * 0.2}"/>`
    art += `<circle cx="${centerX}" cy="${centerY}" r="${radius * 0.4}" fill="${color}" opacity="${0.2 + prng() * 0.3}"/>`
  }

  return art
}

function generateGridArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""
  const gridSpacing = 30 + prng() * 50

  // Vertical lines
  for (let x = 0; x < width; x += gridSpacing) {
    const color = colors[Math.floor(prng() * colors.length)]
    const offset = (prng() - 0.5) * noise * 20
    art += `<line x1="${x + offset}" y1="0" x2="${x + offset}" y2="${height}" stroke="${color}" stroke-width="${1 + prng() * 3}" opacity="${0.3 + prng() * 0.4}"/>`
  }

  // Horizontal lines
  for (let y = 0; y < height; y += gridSpacing) {
    const color = colors[Math.floor(prng() * colors.length)]
    const offset = (prng() - 0.5) * noise * 20
    art += `<line x1="0" y1="${y + offset}" x2="${width}" y2="${y + offset}" stroke="${color}" stroke-width="${1 + prng() * 3}" opacity="${0.3 + prng() * 0.4}"/>`
  }

  return art
}

function generateAbstractArt(
  width: number,
  height: number,
  colors: string[],
  prng: () => number,
  samples: number,
  noise: number,
): string {
  let art = ""

  for (let i = 0; i < samples / 10; i++) {
    const x = prng() * width
    const y = prng() * height
    const radius = 5 + prng() * 30
    const color = colors[Math.floor(prng() * colors.length)]

    art += `<circle cx="${x}" cy="${y}" r="${radius}" fill="${color}" opacity="${0.3 + prng() * 0.4}"/>`
  }

  return art
}
