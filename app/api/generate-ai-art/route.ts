import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { dataset, scenario, colorScheme, seed, numSamples, noise, customPrompt } = await request.json()

    // Create base prompt if no custom prompt provided
    let prompt = customPrompt

    if (!prompt) {
      // Generate sophisticated mathematical art prompt
      const datasetDescriptions = {
        spirals: "Quantum spirals with Fibonacci sequences, logarithmic growth patterns, and Archimedean curves",
        quantum: "Quantum field fluctuations with wave-particle duality, Schrödinger equations, and probability clouds",
        strings: "11-dimensional M-theory projections with Calabi-Yau manifolds and brane interactions",
        fractals: "Fractal dimensions with Hausdorff measures, Julia sets, and Sierpinski triangles",
        topology: "Topological spaces with Klein bottles, Hopf fibrations, and Riemann surfaces",
        moons: "Hyperbolic moons with elliptic curves and non-Euclidean geometry",
        circles: "Manifold torus projections with 4D embeddings and Möbius strips",
        blobs: "Voronoi dynamics with Lorenz attractors and chaos theory",
        checkerboard: "Fractal checkerboards with Mandelbrot iterations and complex plane mappings",
        gaussian: "Multi-modal Gaussian distributions with correlated noise and Perlin fields",
        grid: "Non-linear grids with Klein bottle transformations and wave distortions",
      }

      const scenarioDescriptions = {
        pure: "pure mathematical visualization with sacred geometry, golden ratios, and advanced mathematical structures",
        quantum: "quantum realm with wave-particle duality, superposition states, and quantum entanglement",
        cosmic: "cosmic scale with gravitational lensing, dark matter, and relativistic effects",
        microscopic: "microscopic world with molecular dynamics, Brownian motion, and Van der Waals forces",
        forest: "living forest with L-system fractals, organic growth patterns, and ecosystem dynamics",
        ocean: "deep ocean with Navier-Stokes equations, fluid turbulence, and vortex dynamics",
        neural: "neural networks with synaptic plasticity, information theory, and brain connectivity",
        crystalline: "crystal lattice with symmetry groups, solid state physics, and piezoelectric effects",
        plasma: "plasma physics with magnetohydrodynamics, fusion reactions, and Lorentz forces",
        atmospheric: "atmospheric physics with Rayleigh scattering, Coriolis effects, and fluid mechanics",
        geological: "geological time with tectonic forces, mineral formation, and deep time processes",
        biological: "biological systems with DNA helixes, protein folding, and enzyme kinetics",
      }

      const colorDescriptions = {
        plasma: "deep purple to magenta to brilliant yellow plasma gradients",
        quantum: "probability blue to wave green to particle gold quantum colors",
        cosmic: "void black to nebula purple to star white cosmic palette",
        thermal: "absolute zero blue to fusion core white thermal spectrum",
        spectral: "full electromagnetic spectrum from infrared to ultraviolet",
        crystalline: "diamond white to sapphire blue to emerald green crystal colors",
        bioluminescent: "deep sea blue to algae glow green bioluminescent palette",
        aurora: "solar wind interactions creating aurora borealis colors",
        metallic: "copper to silver to gold to platinum metallic gradients",
        prismatic: "light refraction creating rainbow dispersion effects",
      }

      prompt = `Ultra-high resolution mathematical art featuring ${datasetDescriptions[dataset] || dataset} in a ${scenarioDescriptions[scenario] || scenario} environment. 

Mathematical Foundation: Complex mathematical structures with ${numSamples} precisely calculated data points, incorporating advanced algorithms and theoretical physics principles. Noise factor of ${noise} adds quantum uncertainty and natural variation.

Visual Style: ${colorDescriptions[colorScheme] || colorScheme} color palette with professional HDR lighting, physically-based rendering (PBR), subsurface scattering, and volumetric effects. 

Technical Specifications: 8K resolution, ray-traced reflections, global illumination, depth of field, motion blur where appropriate. Professional photography composition with rule of thirds, leading lines, and dynamic balance.

Artistic Direction: Museum-quality digital art combining scientific accuracy with aesthetic beauty. Intricate details visible at multiple scales from macro to micro. Professional color grading and post-processing effects.

Rendering: Octane render quality, Unreal Engine 5 level detail, photorealistic materials, advanced shader work, particle systems, and procedural generation techniques.

Seed: ${seed} for reproducible mathematical precision.`
    }

    // Use Replicate API for AI art generation
    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version:
          process.env.REPLICATE_MODEL_VERSION || "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
        input: {
          prompt: prompt,
          width: 1024,
          height: 1024,
          num_inference_steps: 50,
          guidance_scale: 7.5,
          seed: seed,
          scheduler: "DPMSolverMultistep",
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Replicate API error: ${response.status}`)
    }

    const prediction = await response.json()

    // Poll for completion
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        },
      })

      result = await pollResponse.json()
    }

    if (result.status === "failed") {
      throw new Error("AI art generation failed")
    }

    return NextResponse.json({
      image: result.output?.[0] || result.output,
      prompt: prompt,
    })
  } catch (error: any) {
    console.error("AI art generation error:", error)
    return NextResponse.json({ error: "Failed to generate AI art", details: error.message }, { status: 500 })
  }
}
