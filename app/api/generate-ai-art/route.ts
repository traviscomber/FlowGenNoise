import { NextResponse } from "next/server"
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

export async function POST(req: Request) {
  try {
    const { dataset, seed, colorScheme, numSamples, noise, scenario } = await req.json()

    if (
      !dataset ||
      typeof seed === "undefined" ||
      !colorScheme ||
      typeof numSamples === "undefined" ||
      typeof noise === "undefined"
    ) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 })
    }

    // Create scenario-enhanced prompt
    let scenarioContext = ""
    if (scenario && scenario !== "none" && DETAILED_SCENARIOS[scenario as keyof typeof DETAILED_SCENARIOS]) {
      const scenarioConfig = DETAILED_SCENARIOS[scenario as keyof typeof DETAILED_SCENARIOS]
      const objectTypes = scenarioConfig.objects.map((obj) => `${obj.type} (${obj.shapes.join(", ")})`).join(", ")

      scenarioContext = `
### Scenario Integration: ${scenarioConfig.name}
Blend the mathematical ${dataset} patterns with immersive ${scenarioConfig.name.toLowerCase()} elements:
- **Objects**: Incorporate ${objectTypes} shaped and positioned according to the mathematical data points
- **Environment**: Use ${scenarioConfig.backgroundColor} as base with ${scenarioConfig.ambientColor} ambient lighting
- **Density**: Apply ${Math.round(scenarioConfig.density * 100)}% object placement density
- **Creative Fusion**: Transform data points into scenario objects while maintaining mathematical structure
- **Atmospheric Details**: Add environmental effects like ${scenario === "enchanted_forest" ? "dappled sunlight, mist, magical sparkles" : scenario === "deep_ocean" ? "water currents, bioluminescence, flowing movements" : scenario === "cosmic_nebula" ? "cosmic dust, stellar radiation, gravitational lensing" : scenario === "cyberpunk_city" ? "neon reflections, holographic effects, digital glitches" : scenario === "ancient_temple" ? "torch shadows, stone textures, mystical auras" : scenario === "crystal_cave" ? "light refractions, crystal echoes, prismatic effects" : scenario === "aurora_borealis" ? "magnetic field visualization, particle interactions, atmospheric glow" : scenario === "volcanic_landscape" ? "heat distortion, volcanic ash, molten textures" : scenario === "neural_connections" ? "synaptic flashes, data flow, subtle organic pulsations" : ""}
`
    }

    const prompt =
      `
      Generate an abstract artwork inspired by a ${dataset} mathematical pattern,
      using a ${colorScheme} color scheme.
      Incorporate elements that evoke a ${scenario} theme.
      The image should be highly detailed, visually striking, and blend the mathematical precision with the organic or thematic elements of the scenario.
      Focus on intricate lines, vibrant colors, and a sense of depth.
      The style should be a fusion of digital art and abstract expressionism.
      Ensure the composition is balanced and visually engaging.
      Seed: ${seed}, Samples: ${numSamples}, Noise: ${noise}.
    ` + scenarioContext

    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: prompt,
      n: 1,
      size: "1024x1024", // DALL-E 3 supports 1024x1024, 1024x1792, 1792x1024
      response_format: "url",
    })

    const imageUrl = response.data[0].url

    if (!imageUrl) {
      throw new Error("Failed to generate image from DALL-E 3.")
    }

    return NextResponse.json({
      image: imageUrl,
      filename: `ai-flowsketch-${dataset}-${Date.now()}.png`,
      settings: { dataset, seed, colorScheme, samples: numSamples, noise, scenario, generationMode: "ai" },
    })
  } catch (error: any) {
    console.error("Error generating AI art:", error)
    return NextResponse.json({ error: error.message || "Failed to generate AI art" }, { status: 500 })
  }
}
