// OpenAI API utility functions for FlowSketch Art Generator

export async function callOpenAI(prompt: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      console.log(`OpenAI API call attempt ${attempt + 1}/${retries + 1}`)
      console.log(`Prompt length: ${prompt.length} characters`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 3900 ? prompt.substring(0, 3900) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          style: "vivid",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error(`OpenAI API error (attempt ${attempt + 1}):`, errorData)

        // Check if it's a content policy violation
        if (errorData.error?.code === "content_policy_violation") {
          console.log("Content policy violation detected, trying with safer prompt...")

          // Generate a comprehensive but safe fallback prompt
          const safePrompt = `Create a magnificent abstract digital artwork masterpiece with geometric patterns, flowing mathematical curves, and harmonious colors. Style: ultra-detailed, museum-quality, professional digital art, perfect composition, breathtaking beauty, artistic excellence, sophisticated design, masterful execution, stunning visual impact, technical precision, creative innovation, artistic mastery, visual sophistication, exceptional quality, gallery-worthy presentation, artistic brilliance, creative vision, technical excellence, professional artistry, masterpiece quality, breathtaking aesthetics, visual poetry, artistic perfection.`

          const safeResponse = await fetch("https://api.openai.com/v1/images/generations", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "dall-e-3",
              prompt: safePrompt,
              n: 1,
              size: "1024x1024",
              quality: "hd",
              style: "vivid",
            }),
          })

          if (safeResponse.ok) {
            const safeData = await safeResponse.json()
            if (safeData.data && safeData.data[0] && safeData.data[0].url) {
              console.log("✅ Generated comprehensive safe fallback artwork")
              return safeData.data[0].url
            }
          }
        }

        if (attempt === retries) {
          throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`)
        }

        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
        continue
      }

      const data = await response.json()

      if (!data.data || !data.data[0] || !data.data[0].url) {
        throw new Error("No image URL returned from OpenAI API")
      }

      return data.data[0].url
    } catch (error) {
      console.error(`OpenAI API call failed (attempt ${attempt + 1}):`, error)

      if (attempt === retries) {
        throw error
      }

      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)))
    }
  }

  throw new Error("All OpenAI API attempts failed")
}

export function generateDomePrompt(
  basePrompt: string,
  domeDiameter = 20,
  domeResolution = "8K",
  projectionType = "fisheye",
): string {
  return `IMMERSIVE PLANETARIUM DOME MATHEMATICAL ART WITH DRAMATIC TUNNEL EFFECT: Transform this extraordinary ABSTRACT MATHEMATICAL ARTWORK for breathtaking ${domeDiameter}m diameter planetarium dome display with stunning fisheye tunnel projection effect.

DOME TUNNEL EFFECT SPECIFICATIONS FOR ${domeDiameter}M DOME:
- DRAMATIC FISHEYE TUNNEL EFFECT with mathematical precision optimized for ${domeDiameter}-meter dome projection
- POWERFUL CENTRAL FOCAL POINT creating tunnel illusion that draws viewers into mathematical depths
- RADIAL MATHEMATICAL PATTERNS flowing outward from center in perfect circular symmetry
- TUNNEL PERSPECTIVE DISTORTION with algorithmic precision creating immersive depth experience
- CIRCULAR FISHEYE COMPOSITION optimized for overhead dome viewing from center position
- SEAMLESS EDGE BLENDING with mathematical precision for perfect ${domeDiameter}m dome wraparound
- DRAMATIC DEPTH ILLUSION using mathematical perspective and algorithmic distortion
- TUNNEL VORTEX EFFECT with mathematical curves spiraling toward central vanishing point
- FISHEYE PROJECTION MAPPING with computational precision for professional planetarium systems
- LITTLE PLANET EFFECT option with stereographic mathematical projection creating curved world illusion
- OVERHEAD VIEWING OPTIMIZATION ensuring perfect visual experience when looking up at ${domeDiameter}m dome ceiling

MATHEMATICAL TUNNEL ARTISTIC VISION:
${basePrompt}

DOME TUNNEL TRANSFORMATION REQUIREMENTS:
Transform this magnificent mathematical concept into a dramatic TUNNEL EFFECT specifically for ${domeDiameter}-meter planetarium dome projection. The composition must feature a powerful central mathematical focal point with all algorithmic elements radiating outward in perfect radial symmetry, creating an absolutely breathtaking tunnel illusion when projected overhead on the ${domeDiameter}m dome ceiling. 

TUNNEL EFFECT SPECIFICATIONS:
- Central vanishing point with mathematical precision drawing viewers into algorithmic depths
- Radial mathematical flow patterns creating tunnel perspective illusion
- Fisheye distortion with computational accuracy for seamless dome projection
- Circular composition boundary perfectly fitted for dome projection systems
- Mathematical tunnel vortex with algorithmic spiral patterns
- Dramatic perspective depth using mathematical curves and geometric progression
- Seamless circular edge blending for perfect dome environment immersion

FINAL DOME TUNNEL VISION: Create a breathtaking ABSTRACT MATHEMATICAL TUNNEL ARTWORK that completely transforms the ${domeDiameter}m dome into an immersive mathematical vortex, with dramatic fisheye tunnel effects, radial mathematical patterns, and algorithmic depth illusion - all rendered as PURE ABSTRACT MATHEMATICAL ART with tunnel projection optimization.`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  panoramaResolution = "16K",
  panoramaFormat = "equirectangular",
  stereographicPerspective?: string,
): string {
  let panoramaPrompt = `IMMERSIVE 360° PANORAMIC MATHEMATICAL ARTWORK: Transform this extraordinary ABSTRACT MATHEMATICAL ART for breathtaking ${panoramaResolution} resolution 360° mathematical viewing experience in professional ${panoramaFormat} format.

360° PANORAMIC MATHEMATICAL ART REQUIREMENTS:
- PURE ABSTRACT MATHEMATICAL VISUALIZATION with seamless wraparound mathematical composition
- Seamless mathematical wraparound with absolutely no visible seams in algorithmic patterns
- Optimal horizontal mathematical aspect ratio specifically designed for 360° mathematical viewing
- Strategic mathematical pattern distribution across the complete 360° algorithmic viewing sphere
- Perfect mathematical horizon placement optimized for VR and 360° mathematical environment compatibility
- Flawless smooth mathematical transitions at wraparound edges with computational precision
- Enhanced mathematical detail density optimized for immersive algorithmic viewing experiences
- Natural mathematical composition flow that works beautifully around the full circular mathematical view
- Professional VR mathematical compatibility with industry-standard 360° algorithmic formats

MATHEMATICAL ARTISTIC VISION FOR 360° EXPERIENCE:
${basePrompt}

360° MATHEMATICAL TRANSFORMATION SPECIFICATIONS:
Transform this magnificent mathematical concept specifically for 360° panoramic viewing, ensuring the mathematical composition flows naturally and beautifully around the full circular view, creating an absolutely immersive mathematical experience when viewed in VR or 360° environments. Every mathematical element should be positioned with algorithmic precision to create a seamless, breathtaking panoramic mathematical experience that surrounds viewers in computational artistic beauty - all rendered as PURE ABSTRACT MATHEMATICAL ART.`

  if (panoramaFormat === "stereographic" && stereographicPerspective) {
    panoramaPrompt += `

ADVANCED STEREOGRAPHIC MATHEMATICAL PROJECTION:
Apply sophisticated ${stereographicPerspective} stereographic mathematical projection for unique and captivating mathematical visual perspective. This creates a distinctive curved mathematical world effect that transforms the flat mathematical artwork into an immersive spherical mathematical experience with dramatic algorithmic perspective distortion, computational precision, and mathematical beauty that showcases the power of advanced mathematical projection techniques - all as PURE ABSTRACT MATHEMATICAL ART.`
  }

  return panoramaPrompt
}
