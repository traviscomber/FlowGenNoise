import { type NextRequest, NextResponse } from "next/server"
import Replicate from "replicate"

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
})

// Convert resolution string to actual dimensions for AI generation
function getResolutionDimensions(resolution: string) {
  switch (resolution) {
    case "1080p":
      return { width: 1080, height: 1080 }
    case "1440p":
      return { width: 1440, height: 1440 }
    case "2160p":
      return { width: 2160, height: 2160 }
    default:
      return { width: 1080, height: 1080 }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("AI Art generation request body:", body)

    const {
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noise,
      customPrompt,
      panoramaResolution = "1080p",
      domeResolution = "1080p",
      panoramic360,
      domeProjection,
      panoramaFormat,
      stereographicPerspective,
      enable4K = false,
      useReplicate = false,
      replicateModel = "stability-ai/sdxl",
    } = body

    // Visual-focused mathematical dataset descriptions (no formula text display)
    const datasetMathematics = {
      spirals: {
        visualDescription: `elegant fibonacci spiral patterns with golden ratio proportions, ${numSamples} spiral arms flowing outward in perfect logarithmic curves, creating mesmerizing swirling patterns with 137.5° divergence angles, organic mathematical beauty with recursive spiral formations`,
        safeDescription: `beautiful fibonacci spiral mathematical patterns, golden ratio geometry, swirling logarithmic curves, ${numSamples} spiral elements, mathematical precision, geometric beauty`,
      },
      fractal: {
        visualDescription: `intricate fractal tree structures with self-similar branching patterns, ${Math.floor(Math.log2(numSamples))} levels of recursive detail, infinite mathematical complexity creating organic tree-like formations with ${numSamples} fractal nodes, each branch containing perfect mathematical symmetry`,
        safeDescription: `mathematical fractal tree patterns, recursive geometry, self-similar branching, ${numSamples} fractal elements, geometric precision, mathematical art`,
      },
      mandelbrot: {
        visualDescription: `stunning mandelbrot set visualization with infinite zoom detail and chaotic boundary patterns, ${numSamples} complex calculation points creating psychedelic mathematical landscapes with intricate edge details and infinite complexity at every scale`,
        safeDescription: `mandelbrot set mathematical patterns, complex number geometry, fractal boundaries, ${numSamples} calculation points, mathematical precision, geometric art`,
      },
      julia: {
        visualDescription: `mesmerizing julia set patterns with kaleidoscopic symmetrical formations, ${numSamples} calculation points creating connected fractal boundaries with perfect mathematical symmetry and infinite detail, stunning geometric complexity`,
        safeDescription: `julia set mathematical patterns, complex number geometry, symmetrical fractals, ${numSamples} calculation points, mathematical beauty, geometric precision`,
      },
      lorenz: {
        visualDescription: `dynamic lorenz attractor visualization with butterfly-shaped strange attractor patterns, ${numSamples} trajectory points creating flowing chaotic curves that never repeat, deterministic chaos with beautiful mathematical flow patterns`,
        safeDescription: `lorenz attractor mathematical patterns, chaos theory geometry, butterfly-shaped curves, ${numSamples} trajectory points, mathematical precision, dynamic systems`,
      },
      hyperbolic: {
        visualDescription: `mind-bending hyperbolic geometry with non-euclidean curved space patterns, ${numSamples} points creating impossible architectural forms with constant negative curvature, geodesic curves forming surreal mathematical landscapes`,
        safeDescription: `hyperbolic geometry mathematical patterns, non-euclidean curves, geodesic lines, ${numSamples} geometric points, mathematical precision, geometric art`,
      },
      gaussian: {
        visualDescription: `smooth gaussian field distributions creating bell curve surfaces and probability landscapes, ${numSamples} statistically distributed points forming organic mathematical flow patterns with natural statistical beauty`,
        safeDescription: `gaussian distribution mathematical patterns, bell curve geometry, probability fields, ${numSamples} statistical points, mathematical precision, smooth curves`,
      },
      cellular: {
        visualDescription: `cellular automata evolution patterns with emergent complexity from simple rules, ${Math.floor(Math.sqrt(numSamples))}×${Math.floor(Math.sqrt(numSamples))} grid creating digital ecosystems with gliders, oscillators, and complex formations`,
        safeDescription: `cellular automata mathematical patterns, grid-based geometry, algorithmic evolution, ${numSamples} cell elements, mathematical precision, geometric patterns`,
      },
      voronoi: {
        visualDescription: `organic voronoi diagram tessellations with natural cell boundaries, ${Math.floor(numSamples / 50)} seed points creating polygonal partitions that mimic biological cell structures and crystalline growth patterns`,
        safeDescription: `voronoi diagram mathematical patterns, polygonal tessellation, geometric cells, ${numSamples} calculation points, mathematical precision, geometric art`,
      },
      perlin: {
        visualDescription: `coherent perlin noise fields with multi-octave fractal properties, ${Math.floor(Math.log2(numSamples))} octaves creating realistic terrain-like surfaces with natural organic textures and smooth mathematical interpolation`,
        safeDescription: `perlin noise mathematical patterns, multi-octave geometry, fractal noise, ${numSamples} sample points, mathematical precision, smooth textures`,
      },
      diffusion: {
        visualDescription: `reaction-diffusion pattern formation with turing instability creating spotted and striped organic textures, ${numSamples} concentration points simulating biological morphogenesis with activator-inhibitor dynamics`,
        safeDescription: `reaction-diffusion mathematical patterns, chemical kinetics geometry, pattern formation, ${numSamples} calculation points, mathematical precision, scientific art`,
      },
      wave: {
        visualDescription: `wave interference patterns with harmonic superposition creating constructive and destructive interference, ${Math.floor(numSamples / 100)} wave sources generating standing wave formations with nodes and antinodes`,
        safeDescription: `wave interference mathematical patterns, harmonic geometry, superposition waves, ${numSamples} calculation points, mathematical precision, wave art`,
      },
      moons: {
        visualDescription: `complex lunar orbital mechanics with multiple moon system featuring ${Math.floor(3 + (seed % 5))} celestial bodies in elliptical orbits, ${numSamples} trajectory points showing gravitational perturbations, tidal forces, and libration effects, creating intricate astronomical dance patterns with orbital resonances and gravitational lensing effects`,
        safeDescription: `lunar orbital mechanics mathematical patterns, celestial body trajectories, gravitational dynamics, ${numSamples} orbital points, astronomical precision, space art`,
      },
    }

    // Visual-focused scenario descriptions that enhance the mathematical patterns
    const scenarioIntegrations = {
      pure: "pure mathematical visualization with abstract geometric forms, clean minimalist composition focusing entirely on the visual beauty of mathematical patterns without environmental distractions",
      landscape: `breathtaking natural landscape where the mathematical patterns become the actual terrain topology, hills and valleys shaped by mathematical curves, dramatic lighting revealing the mathematical structure as natural geological formations`,
      architectural: `stunning architectural structures where mathematical patterns define the building geometry, impossible constructions with mathematical precision, glass and steel frameworks following the mathematical flow, futuristic mathematical architecture`,
      geological: `dramatic geological rock formations where mathematical patterns create mineral structures, crystal lattices and layered sedimentary formations, canyon walls carved by mathematical flow, natural stone textures revealing mathematical order`,
      botanical: `lush botanical structures where mathematical patterns define plant growth, leaf arrangements and root systems following mathematical sequences, flowering blooms positioned by mathematical coordinates, living mathematical forms`,
      atmospheric: `ethereal atmospheric phenomena where mathematical patterns control weather formations, cloud distributions and mist patterns following mathematical flow, aurora effects tracing mathematical curves, celestial mathematical lighting`,
      crystalline: `pristine crystalline structures where mathematical patterns determine crystal geometry, refractive surfaces and prismatic light effects, mineral formations expressing mathematical order through crystal lattice structures`,
      textile: `intricate textile patterns where mathematical sequences define weaving structures, fabric textures and embroidered details positioned by mathematical coordinates, traditional craftsmanship expressing mathematical relationships`,
      metallic: `polished metallic surfaces where mathematical patterns create surface topology, reflective properties following mathematical gradients, industrial textures revealing mathematical structure through engineered finishes`,
      organic: `flowing organic textures where mathematical patterns define biological structures, cellular arrangements and membrane surfaces following mathematical curves, living tissue patterns expressing mathematical relationships`,
      urban: `vibrant urban environments where mathematical patterns define city planning, street layouts and building arrangements following mathematical coordinates, neon lighting tracing mathematical curves, metropolitan mathematical infrastructure`,
      marine: `underwater marine ecosystems where mathematical patterns define water flow, coral reef structures following mathematical growth patterns, aquatic life movements based on mathematical trajectories, oceanic mathematical depth variations`,
    }

    // Build the visual-focused mathematical prompt
    let finalPrompt = customPrompt
    if (!customPrompt) {
      const mathData = datasetMathematics[dataset as keyof typeof datasetMathematics]
      const scenarioIntegration = scenarioIntegrations[scenario as keyof typeof scenarioIntegrations]

      // Add projection-specific descriptions
      let projectionText = ""
      if (panoramic360 && panoramaFormat === "stereographic") {
        if (stereographicPerspective === "tunnel") {
          projectionText =
            ", optimized for stereographic tunnel projection with fisheye perspective, mathematical elements curved around edges creating immersive tunnel effect"
        } else {
          projectionText =
            ", optimized for stereographic little planet projection with fisheye perspective, mathematical terrain in center forming tiny planet effect with curved horizon"
        }
      } else if (domeProjection) {
        projectionText =
          ", optimized for dome projection with fisheye perspective, mathematical patterns distributed across dome surface for immersive planetarium display"
      }

      // Create safe visual-focused prompt for Replicate
      if (useReplicate) {
        finalPrompt = `Stunning mathematical art visualization featuring ${mathData?.safeDescription}. ${scenarioIntegration}. Apply ${colorScheme} color palette with smooth gradients and mathematical precision. Professional digital art, high quality, detailed geometric patterns, clean aesthetic, mathematical beauty, artistic visualization, masterpiece quality${projectionText}. Visual elements: ${numSamples} mathematical components, seed ${seed}, noise level ${noise}.`
      } else {
        // More detailed visual prompt for OpenAI
        finalPrompt = `**MATHEMATICAL ART VISUALIZATION:**

**VISUAL MATHEMATICAL FOUNDATION:**
Create a stunning visual representation of ${dataset.toUpperCase()} mathematical patterns without showing any text or formulas. Focus entirely on the visual beauty of the mathematical relationships.

**MATHEMATICAL VISUALIZATION:**
${mathData?.visualDescription}

**ENVIRONMENTAL INTEGRATION:**
${scenarioIntegration}

**COLOR AND VISUAL DESIGN:**
Apply ${colorScheme} color palette using smooth mathematical color transitions where hue values flow according to mathematical relationships, saturation levels represent pattern intensity, and brightness values follow mathematical gradients. Create seamless color blending that enhances the mathematical beauty.

**TECHNICAL SPECIFICATIONS:**
- Resolution: ${enable4K ? "3840x3840 pixels (4K)" : "1024x1024 pixels (HD)"}
- Visual Elements: ${numSamples} mathematical components rendered with precision
- Noise Integration: ${noise} amplitude variation for organic mathematical flow
- Seed Value: ${seed} for consistent mathematical randomization
- Composition: Professional gallery-quality mathematical art suitable for large-format printing

**VISUAL REQUIREMENTS:**
- Photorealistic rendering with accurate lighting and shadows
- Sharp mathematical edges with perfect anti-aliasing
- Rich visual detail that enhances during upscaling
- Professional composition with mathematical flow guiding the viewer's eye
- Clean aesthetic emphasizing pure mathematical beauty
- High contrast and vibrant colors that highlight mathematical relationships
- Masterpiece quality suitable for art exhibition
- NO TEXT OR FORMULAS - purely visual mathematical art

**MATHEMATICAL INTEGRATION:**
The mathematical relationships should be visually apparent through the patterns, curves, and structures in the artwork. Viewers should experience the mathematical beauty through visual elements rather than text or formulas.

${projectionText}

Create a breathtaking mathematical art masterpiece that celebrates mathematical beauty through pure visual artistry.`
      }
    }

    console.log(`Generated visual mathematical prompt (${finalPrompt.length} characters)`)

    // Choose generation method
    if (useReplicate && process.env.REPLICATE_API_TOKEN) {
      return await generateWithReplicate(finalPrompt, replicateModel, enable4K)
    } else {
      return await generateWithOpenAI(finalPrompt, enable4K)
    }
  } catch (error) {
    console.error("AI Art generation error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : String(error),
      },
      { status: 500 },
    )
  }
}

async function generateWithOpenAI(prompt: string, enable4K: boolean) {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key not configured")
  }

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      attempts++
      console.log(`OpenAI generation attempt ${attempts}/${maxAttempts}`)

      const openaiResponse = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 4000 ? prompt.substring(0, 3997) + "..." : prompt,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
          n: 1,
        }),
      })

      if (!openaiResponse.ok) {
        const errorText = await openaiResponse.text()
        if (errorText.includes("content_policy_violation") && attempts < maxAttempts) {
          console.log("Content policy violation, trying simplified prompt")
          prompt = `Beautiful mathematical ${prompt.split(" ")[0]} patterns, digital art, high quality, detailed, professional composition, clean aesthetic, geometric beauty, mathematical precision, artistic visualization, masterpiece quality`
          continue
        }
        throw new Error(`OpenAI API error: ${openaiResponse.status} - ${errorText}`)
      }

      const data = await openaiResponse.json()
      let imageUrl = data.data[0].url

      // If 4K enabled, upscale the image
      if (enable4K && imageUrl) {
        try {
          const upscaleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/upscale-image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl }),
            },
          )

          if (upscaleResponse.ok) {
            const upscaleData = await upscaleResponse.json()
            if (upscaleData.success) {
              imageUrl = upscaleData.upscaledImageUrl
              return NextResponse.json({
                success: true,
                image: imageUrl,
                resolution: "3840x3840 (4K)",
                revisedPrompt: data.data[0].revised_prompt,
                originalPrompt: prompt,
                promptLength: prompt.length,
                dimensions: { width: 3840, height: 3840 },
                estimatedFileSize: upscaleData.estimatedFileSize || "2.5-3.1MB",
                upscaled: true,
                is4K: true,
                provider: "openai",
              })
            }
          }
        } catch (upscaleError) {
          console.error("4K upscaling failed:", upscaleError)
        }
      }

      return NextResponse.json({
        success: true,
        image: imageUrl,
        resolution: "1024x1024 (HD)",
        revisedPrompt: data.data[0].revised_prompt,
        originalPrompt: prompt,
        promptLength: prompt.length,
        dimensions: { width: 1024, height: 1024 },
        estimatedFileSize: "2-3MB (HD Quality)",
        upscaled: false,
        is4K: false,
        provider: "openai",
      })
    } catch (error: any) {
      if (attempts === maxAttempts) throw error
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempts))
    }
  }
}

async function generateWithReplicate(prompt: string, model: string, enable4K: boolean) {
  if (!process.env.REPLICATE_API_TOKEN) {
    throw new Error("Replicate API token not configured")
  }

  console.log(`Generating with Replicate model: ${model}`)

  // Use correct model configurations with proper versions
  let config
  let modelVersion

  switch (model) {
    case "stability-ai/sdxl":
      modelVersion = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
      config = {
        prompt: prompt,
        negative_prompt:
          "nsfw, nude, sexual, inappropriate, adult content, explicit, violence, gore, disturbing, offensive, text, formulas, equations, numbers, letters, words, mathematical symbols, typography",
        width: 1024,
        height: 1024,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        refine: "expert_ensemble_refiner",
        high_noise_frac: 0.8,
      }
      break
    case "playgroundai/playground-v2.5-1024px-aesthetic":
      modelVersion = "a45f82a1382bed5c7aeb861dac7c7d191b0fdf74d8d57c4a0e6ed7d4d0bf7d24"
      config = {
        prompt: prompt,
        negative_prompt:
          "nsfw, nude, sexual, inappropriate, adult content, explicit, violence, gore, disturbing, offensive, text, formulas, equations, numbers, letters, words, mathematical symbols, typography, ugly, blurry, low quality, distorted, deformed",
        width: 1024,
        height: 1024,
        scheduler: "K_EULER_ANCESTRAL",
        guidance_scale: 3,
        apply_watermark: false,
        num_inference_steps: 50,
      }
      break
    case "bytedance/sdxl-lightning-4step":
      modelVersion = "5f24084160c9089501c1b3545d9be3c27883ae2239b6f412990e82d4a6210f8f"
      config = {
        prompt: prompt,
        negative_prompt:
          "nsfw, nude, sexual, inappropriate, adult content, explicit, violence, gore, disturbing, offensive, text, formulas, equations, numbers, letters, words, mathematical symbols, typography",
        width: 1024,
        height: 1024,
        num_outputs: 1,
        num_inference_steps: 4,
        guidance_scale: 0,
      }
      break
    default:
      // Default to SDXL
      modelVersion = "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b"
      config = {
        prompt: prompt,
        negative_prompt:
          "nsfw, nude, sexual, inappropriate, adult content, explicit, violence, gore, disturbing, offensive, text, formulas, equations, numbers, letters, words, mathematical symbols, typography",
        width: 1024,
        height: 1024,
        num_outputs: 1,
        scheduler: "K_EULER",
        num_inference_steps: 50,
        guidance_scale: 7.5,
        refine: "expert_ensemble_refiner",
        high_noise_frac: 0.8,
      }
  }

  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      attempts++
      console.log(`Replicate generation attempt ${attempts}/${maxAttempts}`)
      console.log("Creating Replicate prediction with config:", config)

      const response = await fetch("https://api.replicate.com/v1/predictions", {
        method: "POST",
        headers: {
          Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          version: modelVersion,
          input: config,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error("Replicate API error:", errorText)
        throw new Error(`Replicate API error: ${response.status} - ${errorText}`)
      }

      const prediction = await response.json()
      console.log("Replicate prediction created:", prediction.id)

      // Poll for completion with timeout
      let result = prediction
      let pollAttempts = 0
      const maxPollAttempts = 60 // 60 seconds timeout

      while ((result.status === "starting" || result.status === "processing") && pollAttempts < maxPollAttempts) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
        pollAttempts++

        const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${prediction.id}`, {
          headers: {
            Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
          },
        })

        if (!pollResponse.ok) {
          throw new Error(`Failed to poll prediction: ${pollResponse.status}`)
        }

        result = await pollResponse.json()
        console.log(`Replicate status (poll attempt ${pollAttempts}):`, result.status)
      }

      if (result.status === "failed") {
        console.error("Replicate generation failed:", result.error)

        // Check if it's an NSFW error and try with a simpler prompt
        if (result.error && result.error.includes("NSFW") && attempts < maxAttempts) {
          console.log("NSFW detected, trying with simplified prompt")
          // Create a very safe, simple prompt
          const safePrompt = `Beautiful abstract mathematical geometric patterns, ${config.prompt.split(" ")[0]} style, digital art, high quality, clean aesthetic, professional composition, geometric beauty, mathematical precision, artistic visualization, masterpiece quality`
          config.prompt = safePrompt
          continue
        }

        throw new Error(`Replicate generation failed: ${result.error || "Unknown error"}`)
      }

      if (result.status !== "succeeded") {
        throw new Error(`Replicate generation timed out or failed. Status: ${result.status}`)
      }

      if (!result.output || !Array.isArray(result.output) || result.output.length === 0) {
        console.error("Invalid Replicate output:", result.output)
        throw new Error("No output from Replicate")
      }

      let imageUrl = result.output[0]
      console.log("Replicate generated image URL:", imageUrl)

      // If 4K enabled, upscale the image
      if (enable4K && imageUrl) {
        try {
          console.log("Starting 4K upscaling for Replicate image...")
          const upscaleResponse = await fetch(
            `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/upscale-image`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ imageUrl }),
            },
          )

          if (upscaleResponse.ok) {
            const upscaleData = await upscaleResponse.json()
            if (upscaleData.success) {
              imageUrl = upscaleData.upscaledImageUrl
              console.log("4K upscaling completed for Replicate image")
              return NextResponse.json({
                success: true,
                image: imageUrl,
                resolution: "3840x3840 (4K)",
                originalPrompt: prompt,
                promptLength: prompt.length,
                dimensions: { width: 3840, height: 3840 },
                estimatedFileSize: upscaleData.estimatedFileSize || "2.5-3.1MB",
                upscaled: true,
                is4K: true,
                provider: "replicate",
                model: model,
              })
            }
          }
          console.log("4K upscaling failed, returning HD version")
        } catch (upscaleError) {
          console.error("4K upscaling failed:", upscaleError)
        }
      }

      return NextResponse.json({
        success: true,
        image: imageUrl,
        resolution: "1024x1024 (HD)",
        originalPrompt: prompt,
        promptLength: prompt.length,
        dimensions: { width: 1024, height: 1024 },
        estimatedFileSize: "2-3MB (HD Quality)",
        upscaled: false,
        is4K: false,
        provider: "replicate",
        model: model,
      })
    } catch (error: any) {
      console.error(`Replicate attempt ${attempts} failed:`, error.message)
      if (attempts === maxAttempts) {
        throw error
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 2000 * attempts))
    }
  }
}
