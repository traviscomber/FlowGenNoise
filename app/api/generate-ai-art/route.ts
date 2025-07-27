import { type NextRequest, NextResponse } from "next/server"
import { default as OpenAI } from "openai"

// Enhanced mathematical datasets with visual descriptions
const MATHEMATICAL_DATASETS = {
  spirals: {
    name: "Fibonacci Spirals",
    description: "Golden ratio spiral patterns with φ = 1.618, creating natural logarithmic curves",
    visualPrompt:
      "fibonacci spiral patterns, golden ratio curves, logarithmic spirals, natural mathematical beauty, organic growth patterns",
  },
  fractal: {
    name: "Fractal Trees",
    description: "Recursive branching structures following Z² + C iterations",
    visualPrompt:
      "fractal tree branches, recursive patterns, self-similar structures, organic mathematical growth, infinite detail complexity",
  },
  mandelbrot: {
    name: "Mandelbrot Set",
    description: "Classic fractal visualization where |Z| < 2",
    visualPrompt:
      "mandelbrot set patterns, complex plane fractals, infinite detail structures, mathematical beauty, chaotic boundaries",
  },
  julia: {
    name: "Julia Sets",
    description: "Complex plane transformations with C = -0.7269",
    visualPrompt:
      "julia set patterns, complex mathematical structures, flowing organic shapes, infinite complexity, dynamic transformations",
  },
  lorenz: {
    name: "Lorenz Attractor",
    description: "Chaotic system dynamics showing butterfly effect",
    visualPrompt:
      "lorenz attractor curves, chaotic flow patterns, butterfly-like structures, dynamic systems, strange attractors",
  },
  hyperbolic: {
    name: "Hyperbolic Geometry",
    description: "Non-Euclidean patterns with K = -1 curvature",
    visualPrompt:
      "hyperbolic geometric patterns, curved space structures, non-euclidean beauty, infinite tessellations, saddle surfaces",
  },
  gaussian: {
    name: "Gaussian Fields",
    description: "Statistical distributions with σ² variance",
    visualPrompt:
      "gaussian field patterns, statistical wave structures, probability distributions, smooth mathematical flows, bell curves",
  },
  cellular: {
    name: "Cellular Automata",
    description: "Emergent grid patterns following Conway's rules",
    visualPrompt:
      "cellular automata patterns, emergent grid structures, rule-based formations, digital life patterns, computational emergence",
  },
  voronoi: {
    name: "Voronoi Diagrams",
    description: "Natural tessellations based on nearest neighbor",
    visualPrompt:
      "voronoi diagram patterns, natural tessellations, cellular structures, organic geometric divisions, proximity-based partitions",
  },
  perlin: {
    name: "Perlin Noise",
    description: "Multi-octave organic texture patterns",
    visualPrompt:
      "perlin noise patterns, organic textures, natural flow structures, smooth mathematical terrain, procedural landscapes",
  },
  diffusion: {
    name: "Reaction-Diffusion",
    description: "Turing patterns from chemical reactions",
    visualPrompt:
      "reaction-diffusion patterns, turing structures, chemical wave formations, natural pattern emergence, biological morphogenesis",
  },
  wave: {
    name: "Wave Interference",
    description: "Harmonic superposition creating interference",
    visualPrompt:
      "wave interference patterns, harmonic superposition, ripple structures, mathematical wave beauty, oscillatory dynamics",
  },
  neural: {
    name: "Neural Networks",
    description: "Interconnected node patterns mimicking brain structures",
    visualPrompt:
      "neural network patterns, interconnected nodes, synaptic connections, brain-like structures, artificial intelligence visualization",
  },
  quantum: {
    name: "Quantum Fields",
    description: "Probability wave functions in quantum mechanics",
    visualPrompt:
      "quantum field patterns, probability waves, subatomic interactions, quantum mechanics visualization, high-energy physics",
  },
  crystalline: {
    name: "Crystal Lattices",
    description: "Atomic structure symmetries in solid state physics",
    visualPrompt:
      "crystal lattice patterns, atomic structures, solid state physics, mineral formations, geological mathematics",
  },
  plasma: {
    name: "Plasma Dynamics",
    description: "Electromagnetic field dynamics in magnetohydrodynamics",
    visualPrompt:
      "plasma dynamics patterns, electromagnetic fields, magnetohydrodynamics, high-energy physics visualization, electric plasma",
  },
}

// Enhanced scenario descriptions
const SCENARIOS = {
  pure: "pure abstract mathematical visualization with clean geometric precision",
  cosmic: "space phenomena and stellar formations with celestial grandeur",
  microscopic: "cellular structures and microscopic worlds with scientific precision",
  crystalline: "crystal lattice structures and mineral formations with prismatic clarity",
  organic: "biological forms and natural organic textures with life-like qualities",
  atmospheric: "weather phenomena and cloud formations with dynamic atmospheric effects",
  quantum: "quantum realm subatomic interactions, particle physics, quantum field theory visualization",
  neural: "neural network brain synapses, neuroscience visualization, cognitive mathematics, consciousness patterns",
  electromagnetic: "electromagnetic field visualizations, Maxwell equations, wave propagation, energy mathematics",
  fluid: "fluid dynamics flow patterns, Navier-Stokes equations, turbulence mathematics, hydrodynamics",
  botanical: "plant growth patterns and organic botanical forms with living complexity",
  geological: "rock formations and mineral crystalline structures with natural textures",
  architectural: "geometric building structures and urban forms with structural elegance",
  textile: "fabric weaving patterns and textile designs with tactile richness",
}

// Enhanced color scheme descriptions
const COLOR_SCHEMES = {
  plasma: "electric purple and blue plasma energy colors with luminous intensity",
  quantum: "glowing green and blue quantum field colors with ethereal radiance",
  cosmic: "deep purple and blue cosmic space colors with stellar depth",
  thermal: "red, orange, and yellow thermal heat colors with fiery intensity",
  spectral: "full rainbow spectrum color transitions with prismatic brilliance",
  crystalline: "blue, white, and silver crystalline ice colors with frozen clarity",
  bioluminescent: "aquatic blue and green bioluminescent colors with organic glow",
  aurora: "dancing green and purple aurora borealis colors with atmospheric magic",
  metallic: "gold, silver, and bronze metallic colors with lustrous reflectivity",
  prismatic: "rainbow prismatic light refraction colors with optical beauty",
  monochromatic: "elegant grayscale monochromatic colors with tonal sophistication",
  infrared: "heat signature red infrared colors with thermal visualization",
  neon: "bright fluorescent neon colors with electric vibrancy",
  sunset: "warm orange and pink sunset sky colors with golden hour magic",
  ocean: "deep blue and teal ocean depth colors with aquatic mystery",
  forest: "green and earth tone forest nature colors with organic warmth",
  volcanic: "volcanic orange and red molten lava colors with geological power",
  arctic: "cool blue and white arctic ice colors with polar serenity",
}

// NSFW content filter - comprehensive word list
const NSFW_WORDS = [
  "nude",
  "naked",
  "sex",
  "sexual",
  "porn",
  "erotic",
  "adult",
  "explicit",
  "nsfw",
  "xxx",
  "fetish",
  "kinky",
  "seductive",
  "provocative",
  "sensual",
  "intimate",
  "arousing",
  "suggestive",
  "risque",
  "lewd",
  "vulgar",
  "obscene",
  "breast",
  "nipple",
  "genital",
  "penis",
  "vagina",
  "ass",
  "butt",
  "sexy",
  "hot",
  "steamy",
  "naughty",
  "dirty",
  "raunchy",
  "slutty",
  "horny",
]

// Content sanitization function
function sanitizePrompt(prompt: string): string {
  let sanitized = prompt.toLowerCase()
  NSFW_WORDS.forEach((word) => {
    const regex = new RegExp(`\\b${word}\\b`, "gi")
    sanitized = sanitized.replace(regex, "abstract")
  })
  return sanitized
}

// Progressive safety prompts (4-tier system)
function getSafetyPrompt(level: number): string {
  const safetyPrompts = [
    "", // Level 0: No additional safety
    "safe for work, family-friendly, appropriate content, ", // Level 1: Basic safety
    "completely safe, educational, scientific visualization, appropriate for all audiences, ", // Level 2: Enhanced safety
    "ultra-safe, purely mathematical, abstract geometric patterns, scientific educational content only, ", // Level 3: Maximum safety
  ]
  return safetyPrompts[Math.min(level, 3)]
}

export async function POST(request: NextRequest) {
  try {
    console.log("🚀 Starting AI art generation request...")

    // Check environment variables
    if (!process.env.OPENAI_API_KEY) {
      console.error("❌ OPENAI_API_KEY environment variable is not set")
      return NextResponse.json({ success: false, error: "OpenAI API key not configured" }, { status: 500 })
    }

    // Dynamic import of OpenAI - this will only run on server side in API routes
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    })

    console.log("✅ OpenAI client initialized successfully")

    // Parse request body with error handling
    let body
    try {
      body = await request.json()
      console.log("📝 Request body parsed successfully")
    } catch (parseError) {
      console.error("❌ Failed to parse request body:", parseError)
      return NextResponse.json({ success: false, error: "Invalid request format" }, { status: 400 })
    }

    const {
      dataset = "spirals",
      scenario = "pure",
      colorScheme = "plasma",
      seed = 1234,
      customPrompt = "",
      projectionType = "little-planet",
      resolution = "2160p",
      enable4K = false,
    } = body

    console.log("🎯 Generation parameters:", { dataset, scenario, colorScheme, projectionType, enable4K })

    // Build enhanced prompt
    let enhancedPrompt = ""

    try {
      console.log("🎨 Building enhanced prompt...")

      // Get dataset information
      const datasetInfo = MATHEMATICAL_DATASETS[dataset as keyof typeof MATHEMATICAL_DATASETS]
      const scenarioDesc = SCENARIOS[scenario as keyof typeof SCENARIOS]
      const colorDesc = COLOR_SCHEMES[colorScheme as keyof typeof COLOR_SCHEMES]

      // Build base prompt
      const basePrompt = `A masterful ${projectionType} stereographic projection showcasing ${datasetInfo?.description || dataset} rendered in ${scenarioDesc || scenario} style with ${colorDesc || colorScheme}. Professional photography quality with dramatic lighting, perfect composition, ultra-high detail, award-winning digital art, museum quality, 8K resolution, photorealistic rendering, cinematic lighting, depth of field, artistic masterpiece.`

      // Add custom prompt if provided
      enhancedPrompt = customPrompt && customPrompt.trim() ? `${customPrompt.trim()} ${basePrompt}` : basePrompt

      // Add projection-specific enhancements
      const projectionEnhancement =
        projectionType === "little-planet"
          ? "little planet effect, spherical world projection, curved horizon, 360-degree perspective, fisheye lens effect"
          : "tunnel view projection, inverted perspective, infinite depth, radial symmetry, hyperbolic geometry"

      enhancedPrompt += ` ${projectionEnhancement}, mathematical precision, scientific accuracy, professional quality`

      console.log("✅ Enhanced prompt built successfully")
      console.log("📏 Prompt length:", enhancedPrompt.length)
    } catch (promptError) {
      console.error("❌ Failed to build enhanced prompt:", promptError)
      enhancedPrompt =
        "A beautiful mathematical visualization with stereographic projection, professional quality, artistic masterpiece."
    }

    // 4-tier retry system with progressive safety
    let attempts = 0
    const maxAttempts = 4
    let lastError = ""

    while (attempts < maxAttempts) {
      attempts++
      console.log(`🔄 Generation attempt ${attempts}/${maxAttempts}`)

      try {
        // Apply progressive safety measures
        const safetyLevel = attempts - 1
        const safetyPrefix = getSafetyPrompt(safetyLevel)
        const finalPrompt = sanitizePrompt(`${safetyPrefix}${enhancedPrompt}`)

        console.log(`🛡️ Using safety level ${safetyLevel}`)
        console.log("🎯 Final prompt preview:", finalPrompt.substring(0, 150) + "...")

        console.log("🤖 Calling OpenAI DALL-E 3...")

        const response = await openai.images.generate({
          model: "dall-e-3",
          prompt: finalPrompt.substring(0, 4000), // DALL-E 3 has a 4000 character limit
          n: 1,
          size: "1024x1024", // DALL-E 3 standard size
          quality: enable4K ? "hd" : "standard",
          style: "natural",
        })

        const imageUrl = response.data[0]?.url
        const revisedPrompt = response.data[0]?.revised_prompt

        if (!imageUrl) {
          throw new Error("No image URL returned from OpenAI")
        }

        console.log("✅ AI art generated successfully!")
        console.log("🖼️ Image URL received")

        return NextResponse.json({
          success: true,
          image: imageUrl,
          provider: "OpenAI",
          model: "DALL-E 3",
          attempts,
          originalPrompt: enhancedPrompt,
          finalPrompt,
          revisedPrompt,
          promptLength: finalPrompt.length,
          is4K: enable4K,
          dimensions: { width: 1024, height: 1024 },
          estimatedFileSize: enable4K ? "~2.1MB" : "~1.5MB",
          safetyLevel,
        })
      } catch (error: any) {
        console.error(`❌ Attempt ${attempts} failed:`, error.message)
        lastError = error.message

        // If it's an NSFW error, increase safety level and retry
        if (
          error.message?.toLowerCase().includes("nsfw") ||
          error.message?.toLowerCase().includes("safety") ||
          error.message?.toLowerCase().includes("content policy") ||
          error.message?.toLowerCase().includes("violated")
        ) {
          console.log("🛡️ Content policy violation detected, increasing safety level and retrying...")
          continue
        }

        // For rate limit errors, wait longer
        if (error.message?.toLowerCase().includes("rate limit")) {
          console.log("⏳ Rate limit detected, waiting longer before retry...")
          await new Promise((resolve) => setTimeout(resolve, 5000))
          continue
        }

        // For other errors, wait before retry
        if (attempts < maxAttempts) {
          console.log(`⏳ Waiting before retry...`)
          await new Promise((resolve) => setTimeout(resolve, 2000))
        }
      }
    }

    // All attempts failed
    console.error("💥 All generation attempts failed")
    console.error("🔍 Last error:", lastError)

    return NextResponse.json(
      {
        success: false,
        error: `Generation failed after ${maxAttempts} attempts. ${lastError.includes("API key") ? "Please check OpenAI API key configuration." : "Please try again with different parameters."}`,
        attempts,
        lastError,
      },
      { status: 500 },
    )
  } catch (error: any) {
    console.error("🚨 Unexpected error in AI art generation:", error)

    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred during generation. Please try again.",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: "healthy",
    service: "AI Art Generation API",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  })
}
