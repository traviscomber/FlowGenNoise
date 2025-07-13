import { NextResponse } from "next/server"
import { generateText, experimental_generateImage } from "ai"
import { openai } from "@ai-sdk/openai"
// Removed: import { SCENARIOS } from "@/lib/flow-model" - using detailed scenarios defined below

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
- **Atmospheric Details**: Add environmental effects like ${scenario === "enchanted_forest" ? "dappled sunlight, mist, magical sparkles" : scenario === "deep_ocean" ? "water currents, bioluminescence, flowing movements" : scenario === "cosmic_nebula" ? "cosmic dust, stellar radiation, gravitational lensing" : scenario === "cyberpunk_city" ? "neon reflections, holographic effects, digital glitches" : scenario === "ancient_temple" ? "torch shadows, stone textures, mystical auras" : scenario === "crystal_cave" ? "light refractions, crystal echoes, prismatic effects" : scenario === "aurora_borealis" ? "magnetic field visualization, particle interactions, atmospheric glow" : scenario === "volcanic_landscape" ? "heat distortion, volcanic ash, molten textures" : scenario === "neural_connections" ? "synaptic flashes, data flow, subtle organic pulsations" : ""}`
    }

    const { text: imagePrompt } = await generateText({
      model: openai("gpt-4o"),
      prompt: `*Image Generation Prompt for DALL-E 3:*

Create an intricate generative art masterpiece inspired by a '${dataset}' dataset, employing a '${colorScheme}' color scheme. The artwork should serve as an ideal base for professional 8K upscaling, focusing on clean, sharp edges and well-defined structures.${scenarioContext}

### Elements:
1. *Mathematical Precision*: Arrange exactly ${numSamples} ${dataset} elements organically across the canvas, ensuring each one is unique yet harmoniously integrated with the others. The elements should vary in size and density, creating a dynamic flow throughout the piece.

2. *Color Palette*: Utilize a vibrant and high-contrast ${colorScheme} color scheme to emphasize the patterns. Create depth and dimension with strategic color gradients and transitions.

3. *Textures and Patterns*: Introduce complex textures within the ${dataset} patterns, such as fine lines, cross-hatching, or dotting, which will reveal new details upon close inspection. Ensure that these intricate patterns are meticulously crafted to reward viewers and enhance during upscaling.

4. *Noise Texture*: Apply a subtle noise texture of ${noise} to the entire image, giving it a tactile surface that adds sophistication and visual interest without overwhelming the primary elements.

### Composition:
- *Professional Composition*: Design the composition with a balance that suits large-format printing. The ${dataset} elements should guide the viewer's eye seamlessly across the canvas, creating a sense of movement and energy.
- *Gallery-Quality*: Ensure that the overall artwork exudes a refined, gallery-quality aesthetic suitable for exhibition, with each element contributing to a cohesive and engaging visual narrative.

### Optimization for Upscaling:
- *Edge Definition*: Focus on maintaining sharp, clean edges around each element and between color transitions to ensure clarity and precision are preserved during upscaling.
- *Detail Enhancement*: Design with rich detail that enhances beautifully when processed through AI upscaling algorithms, emphasizing the depth and complexity of the piece.

By adhering to these guidelines, the resulting image will be an exquisite generative art masterpiece, optimized for professional 8K upscaling and perfect for large-format, gallery-quality display.`,
      temperature: 0.8,
    })

    console.log("Generated Enhanced Prompt:", imagePrompt)

    const { image } = await experimental_generateImage({
      model: openai.image("dall-e-3"),
      prompt: imagePrompt,
      quality: "hd",
      size: "1792x1024",
      style: "vivid",
    })

    const baseImage = `data:image/png;base64,${image.base64}`

    return NextResponse.json({
      image: baseImage,
      baseResolution: "1792x1024",
      readyForUpscaling: true,
      recommendedUpscale: "4x",
      scenario: scenario || null,
    })
  } catch (error: any) {
    console.error("Error generating AI art:", error)
    if (error.message.includes("api_key")) {
      return NextResponse.json(
        { error: "OpenAI API key is missing or invalid. Please set OPENAI_API_KEY." },
        { status: 500 },
      )
    }
    return NextResponse.json({ error: "Failed to generate AI art: " + error.message }, { status: 500 })
  }
}
