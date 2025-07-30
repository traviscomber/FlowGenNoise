import { type NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define detailed scenarios for AI prompt generation
const DETAILED_SCENARIOS = {
  none: {
    name: "Pure Mathematical",
    objects: [],
    backgroundColor: "white",
    ambientColor: "neutral light",
    density: 0,
  },
  enchanted_forest: {
    name: "Enchanted Forest",
    objects: [
      { type: "mystical trees", shapes: ["spiraling branches", "glowing leaves", "twisted trunks"] },
      { type: "magical creatures", shapes: ["fairy lights", "ethereal wisps", "forest spirits"] },
      { type: "ancient stones", shapes: ["moss-covered rocks", "runic circles", "crystal formations"] },
    ],
    backgroundColor: "deep forest green",
    ambientColor: "golden sunlight filtering through canopy",
    density: 0.7,
  },
  deep_ocean: {
    name: "Deep Ocean",
    objects: [
      { type: "marine life", shapes: ["flowing jellyfish", "coral formations", "sea anemomas"] },
      { type: "underwater currents", shapes: ["swirling water", "bubble streams", "kelp forests"] },
      { type: "bioluminescent organisms", shapes: ["glowing plankton", "light trails", "phosphorescent waves"] },
    ],
    backgroundColor: "deep ocean blue",
    ambientColor: "bioluminescent blue-green glow",
    density: 0.6,
  },
  cosmic_nebula: {
    name: "Cosmic Nebula",
    objects: [
      { type: "stellar formations", shapes: ["star clusters", "gas clouds", "cosmic dust"] },
      { type: "celestial bodies", shapes: ["distant planets", "asteroid fields", "comet trails"] },
      { type: "energy phenomena", shapes: ["plasma streams", "magnetic fields", "gravitational waves"] },
    ],
    backgroundColor: "deep space black",
    ambientColor: "cosmic purple and pink nebula glow",
    density: 0.5,
  },
  cyberpunk_city: {
    name: "Cyberpunk City",
    objects: [
      { type: "neon structures", shapes: ["holographic displays", "data streams", "circuit patterns"] },
      { type: "urban elements", shapes: ["skyscrapers", "flying vehicles", "digital billboards"] },
      { type: "tech interfaces", shapes: ["glowing terminals", "laser grids", "virtual reality portals"] },
    ],
    backgroundColor: "dark urban night",
    ambientColor: "neon pink and cyan lighting",
    density: 0.8,
  },
  ancient_temple: {
    name: "Ancient Temple",
    objects: [
      { type: "architectural elements", shapes: ["stone pillars", "carved reliefs", "sacred geometries"] },
      { type: "mystical artifacts", shapes: ["glowing orbs", "ancient symbols", "ritual circles"] },
      { type: "natural overgrowth", shapes: ["climbing vines", "moss patterns", "weathered stones"] },
    ],
    backgroundColor: "warm sandstone",
    ambientColor: "golden torch light and shadows",
    density: 0.6,
  },
  crystal_cave: {
    name: "Crystal Cave",
    objects: [
      { type: "crystal formations", shapes: ["prismatic clusters", "refracting surfaces", "geometric crystals"] },
      { type: "mineral deposits", shapes: ["stalactites", "stalagmites", "mineral veins"] },
      { type: "light phenomena", shapes: ["rainbow refractions", "crystal reflections", "inner glow"] },
    ],
    backgroundColor: "deep cave darkness",
    ambientColor: "prismatic crystal light",
    density: 0.7,
  },
  aurora_borealis: {
    name: "Aurora Borealis",
    objects: [
      { type: "atmospheric phenomena", shapes: ["dancing lights", "magnetic field lines", "particle streams"] },
      { type: "arctic landscape", shapes: ["ice formations", "snow drifts", "frozen lakes"] },
      { type: "celestial elements", shapes: ["star fields", "moon phases", "cosmic radiation"] },
    ],
    backgroundColor: "arctic night sky",
    ambientColor: "green and purple aurora light",
    density: 0.4,
  },
  volcanic_landscape: {
    name: "Volcanic Landscape",
    objects: [
      { type: "volcanic features", shapes: ["lava flows", "volcanic rock", "steam vents"] },
      { type: "thermal phenomena", shapes: ["heat waves", "molten streams", "glowing embers"] },
      { type: "geological formations", shapes: ["basalt columns", "crater rims", "ash clouds"] },
    ],
    backgroundColor: "dark volcanic rock",
    ambientColor: "orange and red lava glow",
    density: 0.6,
  },
  neural_connections: {
    // New detailed scenario for Neural Connections
    name: "Neural Connections",
    objects: [
      { type: "neurons", shapes: ["spherical cell bodies", "dendritic branches", "axon terminals"] },
      { type: "synapses", shapes: ["glowing connection points", "electrical impulses", "neurotransmitter bursts"] },
      { type: "organic roots", shapes: ["interwoven fibrous structures", "vascular networks", "mycelial patterns"] },
      { type: "data nodes", shapes: ["glowing data packets", "information streams", "network hubs"] },
    ],
    backgroundColor: "deep, ethereal grey-purple",
    ambientColor: "subtle bioluminescent green and orange glows",
    density: 0.75,
  },
}

export async function POST(request: NextRequest) {
  try {
    const { prompt, model = "flux-schnell" } = await request.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: process.env.REPLICATE_MODEL_VERSION,
        input: {
          prompt,
          num_outputs: 1,
          aspect_ratio: "1:1",
          output_format: "png",
          output_quality: 80,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.statusText}`)
    }

    const prediction = await response.json()
    return NextResponse.json({ predictionId: prediction.id })
  } catch (error) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: "Failed to generate AI art" }, { status: 500 })
  }
}
