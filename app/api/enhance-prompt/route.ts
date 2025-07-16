import { NextResponse, type NextRequest } from "next/server"

export async function POST(req: NextRequest) {
  try {
    const { prompt, dataset, scenario } = await req.json()

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 })
    }

    // Complex mathematical dataset-specific prompt enhancement
    let enhancedPrompt = prompt
    let mathematicalContext = ""
    let visualCharacteristics = ""
    let technicalDetails = ""

    // Dataset-specific mathematical and visual enhancements
    switch (dataset) {
      case "spirals":
        mathematicalContext = "Archimedean and logarithmic spiral formations with golden ratio proportions"
        visualCharacteristics =
          "flowing curved trajectories, fibonacci sequences, nautilus shell patterns, vortex dynamics"
        technicalDetails =
          "parametric equations r = a + bθ, smooth gradient transitions, angular momentum visualization"
        break

      case "moons":
        mathematicalContext = "crescent-shaped manifolds with non-linear separability boundaries"
        visualCharacteristics =
          "dual crescents, phase transitions, binary classification regions, lunar cycle aesthetics"
        technicalDetails = "half-moon topology, decision boundary visualization, support vector machine geometry"
        break

      case "circles":
        mathematicalContext = "concentric circular distributions with radial symmetry and polar coordinates"
        visualCharacteristics = "perfect geometric circles, radial patterns, orbital mechanics, ripple effects"
        technicalDetails = "equation x² + y² = r², uniform angular distribution, centripetal force visualization"
        break

      case "blobs":
        mathematicalContext = "organic blob-like clusters with Gaussian mixture distributions"
        visualCharacteristics = "fluid organic shapes, cellular structures, amoeba-like forms, soft boundaries"
        technicalDetails = "multivariate normal distributions, covariance matrices, probability density contours"
        break

      case "checkerboard":
        mathematicalContext = "discrete grid patterns with alternating binary states and tessellation"
        visualCharacteristics =
          "sharp geometric transitions, chess-like patterns, pixel art aesthetics, digital matrices"
        technicalDetails = "discrete topology, binary classification, Manhattan distance metrics, grid sampling"
        break

      case "gaussian":
        mathematicalContext = "normal distribution with bell curve characteristics and statistical properties"
        visualCharacteristics =
          "smooth probability clouds, central clustering, statistical heat maps, gradient densities"
        technicalDetails = "μ = 0, σ² variance, 68-95-99.7 rule visualization, Box-Muller transformation"
        break

      case "grid":
        mathematicalContext = "regular lattice structures with crystalline symmetry and periodic patterns"
        visualCharacteristics =
          "perfect geometric grids, crystal lattice formations, architectural frameworks, mesh networks"
        technicalDetails = "uniform sampling, Cartesian coordinates, periodic boundary conditions, lattice vectors"
        break

      default:
        mathematicalContext = "complex mathematical structures with emergent patterns"
        visualCharacteristics = "abstract geometric forms, mathematical beauty, algorithmic art"
        technicalDetails = "computational geometry, numerical methods, data visualization"
    }

    // Scenario-specific artistic enhancements
    let scenarioEnhancement = ""
    switch (scenario) {
      case "forest":
        scenarioEnhancement =
          "Render as an enchanted forest where mathematical patterns become living trees, branches following fractal growth, bioluminescent mathematical equations glowing on bark, moss-covered geometric structures, dappled sunlight creating natural mathematical shadows, organic integration of formulas into nature"
        break

      case "cosmic":
        scenarioEnhancement =
          "Transform into a cosmic nebula where mathematical structures become stellar formations, equations written in starlight, gravitational lensing effects, cosmic microwave background patterns, dark matter visualization, celestial mechanics in deep space colors"
        break

      case "ocean":
        scenarioEnhancement =
          "Visualize as underwater mathematical coral reefs, equations flowing like ocean currents, bioluminescent mathematical creatures, wave interference patterns, fluid dynamics visualization, deep sea pressure gradients affecting geometric forms"
        break

      case "neural":
        scenarioEnhancement =
          "Represent as neural network synapses where mathematical patterns become brain connections, electrical impulses following geometric paths, neurotransmitter visualization, cognitive pattern recognition, artificial intelligence aesthetics"
        break

      case "fire":
        scenarioEnhancement =
          "Manifest as mathematical flames where equations burn with intense heat, plasma physics visualization, combustion reaction patterns, thermodynamic gradients, molten mathematical structures, phoenix-like geometric rebirth"
        break

      case "ice":
        scenarioEnhancement =
          "Crystallize as frozen mathematical structures, ice crystal formation patterns, phase transition visualization, crystallographic symmetry, frozen equations in glacial formations, arctic mathematical landscapes"
        break

      case "desert":
        scenarioEnhancement =
          "Form as desert sand dune patterns where wind erosion creates mathematical beauty, geological stratification, mineral crystal formations, oasis-like geometric sanctuaries, archaeological mathematical discoveries"
        break

      case "sunset":
        scenarioEnhancement =
          "Illuminate with golden hour lighting where mathematical patterns cast long shadows, atmospheric scattering effects, warm color temperature gradients, silhouetted geometric forms against vibrant skies"
        break

      case "monochrome":
        scenarioEnhancement =
          "Render in sophisticated grayscale where mathematical elegance is expressed through pure form, shadow, and light, minimalist aesthetic, high contrast geometric relationships, architectural mathematical beauty"
        break

      default:
        scenarioEnhancement = "Present with clean mathematical precision and elegant geometric beauty"
    }

    // Construct the enhanced prompt
    enhancedPrompt = `${prompt}

MATHEMATICAL FOUNDATION: ${mathematicalContext}

VISUAL CHARACTERISTICS: Incorporate ${visualCharacteristics} with precise mathematical accuracy and aesthetic appeal.

TECHNICAL IMPLEMENTATION: ${technicalDetails}

ARTISTIC INTERPRETATION: ${scenarioEnhancement}

RENDERING SPECIFICATIONS: 
- Ultra-high detail mathematical visualization
- Professional scientific illustration quality
- Perfect geometric precision with artistic flair
- Rich color theory application
- Dynamic lighting and shadow effects
- Depth and dimensional accuracy
- Clean, elegant composition
- Mathematical beauty emphasized through visual design

Create a masterpiece that bridges pure mathematics with stunning visual artistry, where every element serves both scientific accuracy and aesthetic excellence.`

    return NextResponse.json({ enhancedPrompt })
  } catch (err) {
    console.error("❌ enhance-prompt route error:", err)
    return NextResponse.json({ error: "Failed to enhance prompt" }, { status: 500 })
  }
}
