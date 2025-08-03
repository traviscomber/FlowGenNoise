export async function callOpenAI(prompt: string): Promise<string> {
  const maxRetries = 3
  const baseDelay = 2000 // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: AbortSignal.timeout(120000), // 2 minute timeout
      })

      console.log(`📡 OpenAI API response status: ${response.status}`)
      console.log(`📡 OpenAI API response headers:`, Object.fromEntries(response.headers.entries()))

      // Get response text first to handle non-JSON responses
      const responseText = await response.text()
      console.log(`📄 Response text preview: ${responseText.substring(0, 200)}...`)

      // Check if response is JSON
      let responseData
      try {
        // Validate JSON format before parsing
        if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
          responseData = JSON.parse(responseText)
        } else {
          throw new Error(`Non-JSON response received: ${responseText.substring(0, 200)}...`)
        }
      } catch (parseError: any) {
        console.error(`❌ JSON parsing failed:`, parseError.message)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error(`❌ OpenAI API error response:`, responseData)

        // Determine if we should retry based on status code
        const shouldRetry = response.status >= 500 || response.status === 429 || response.status === 503

        if (shouldRetry && attempt < maxRetries) {
          const delay =
            response.status === 429
              ? baseDelay * Math.pow(2, attempt) * 2 // Longer delay for rate limits
              : baseDelay * Math.pow(2, attempt - 1) // Exponential backoff for server errors

          console.log(`⏳ Retrying in ${delay}ms due to ${response.status} error...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`)
      }

      // Validate response structure
      if (!responseData?.data?.[0]?.url) {
        console.error(`❌ Invalid response structure:`, responseData)
        throw new Error("Invalid response structure: missing image URL")
      }

      const imageUrl = responseData.data[0].url
      console.log(`✅ OpenAI API success: ${imageUrl.substring(0, 50)}...`)
      return imageUrl
    } catch (error: any) {
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error.message)

      // Don't retry on certain errors
      if (
        error.message.includes("Invalid JSON") ||
        error.message.includes("400") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`OpenAI API call failed after ${maxRetries} attempts: ${error.message}`)
      }

      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("OpenAI API call failed: Maximum retries exceeded")
}

export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "4K",
  projectionType = "fisheye",
): string {
  console.log(`🏛️ Generating dome prompt with projection type: ${projectionType}`)

  // Define projection-specific transformations with enhanced TUNNEL UP effects
  const projectionSpecs: Record<string, string> = {
    fisheye:
      "FISHEYE LENS DISTORTION with dramatic immersive upward-looking TUNNEL UP view specifically designed for dome ceiling display, spherical fisheye mapping with zenith focus point creating powerful tunnel-like perspective effect where all content appears to flow upward toward the center creating an illusion of looking up through a cosmic tunnel, radial symmetry expanding outward from center with enhanced peripheral detail and dramatic circular fisheye distortion, TUNNEL UP perspective distortion specifically calibrated for planetarium dome ceiling projection where viewers look up and see content flowing toward the dome center like a tunnel effect, enhanced radial composition for immersive overhead viewing experience, circular fisheye format with 180-degree field of view compressed into circular frame, content arranged in concentric circles flowing toward center point",
    equidistant:
      "equidistant projection mapping with uniform angular distribution across dome surface, linear relationship between angle and radius for accurate dome projection, precise angular measurements for planetarium systems, content distributed evenly across dome hemisphere",
    stereographic:
      "stereographic projection with conformal mapping preserving angles and shapes, enhanced peripheral detail with smooth distortion gradients, optimal for dome edge clarity, content maintains proportional relationships across dome surface",
    orthographic:
      "orthographic projection with parallel ray mapping, maintaining true proportions across dome surface, ideal for architectural dome displays, content appears as if viewed from infinite distance",
    azimuthal:
      "azimuthal projection with radial symmetry from dome center, equal-area mapping for consistent brightness across dome surface, optimized for fulldome cinema, content distributed with equal area preservation",
  }

  const projectionSpec = projectionSpecs[projectionType] || projectionSpecs.fisheye

  // Enhanced dome prompt with strong TUNNEL UP emphasis for fisheye
  let domePrompt = `${basePrompt}, PLANETARIUM DOME PROJECTION TRANSFORMATION: Convert this artwork into a ${diameter}m diameter planetarium dome projection using ${projectionType.toUpperCase()} PROJECTION TYPE with ${projectionSpec}, ${resolution} ultra-high resolution optimized for planetarium projection systems`

  // Add specific TUNNEL UP formatting for fisheye
  if (projectionType === "fisheye") {
    domePrompt += `, CRITICAL FISHEYE TUNNEL UP FORMAT REQUIREMENTS: circular fisheye image with all content flowing toward center point creating dramatic upward tunnel perspective, content arranged in concentric circles with strongest detail at center diminishing toward edges, 180-degree field of view compressed into perfect circle, dramatic radial distortion where straight lines curve toward center point, zenith-focused composition where viewers look up through cosmic tunnel toward dome ceiling, fisheye lens effect with barrel distortion creating immersive tunnel-up illusion, circular frame format with black corners outside the fisheye circle`
  }

  domePrompt += `, immersive 180-degree field of view with dramatic perspective distortion, dome-optimized composition with seamless edge blending for overhead viewing, planetarium-grade visual quality meeting astronomical projection standards, fulldome cinema format creating sense of looking up through a cosmic tunnel toward the dome ceiling, ${projectionType} distortion specifically calibrated for ${diameter}m dome systems with enhanced perspective effect for immersive planetarium experience`

  console.log(`🏛️ Generated dome prompt length: ${domePrompt.length} characters`)
  console.log(`🏛️ Projection type applied: ${projectionType}`)

  if (projectionType === "fisheye") {
    console.log(`🐟 FISHEYE TUNNEL UP format requirements added`)
  }

  return domePrompt
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const perspectiveText = perspective ? `, ${perspective} perspective transformation` : ""
  console.log(`🌐 Generating panorama prompt with format: ${format}, resolution: ${resolution}`)

  // Define format-specific transformations
  const formatSpecs: Record<string, string> = {
    equirectangular:
      "equirectangular projection mapping for VR and immersive displays with proper 2:1 aspect ratio, spherical panoramic format suitable for VR headsets and 360-degree viewers, seamless horizontal wrapping with no visible seams",
    cubemap:
      "cubemap projection with six faces for 360-degree coverage, optimized for real-time rendering and VR applications, seamless face transitions",
    cylindrical:
      "cylindrical projection with horizontal 360-degree coverage, vertical perspective maintained, ideal for panoramic displays",
    mercator:
      "Mercator projection with conformal mapping, preserving angles and shapes across panoramic view, enhanced for wide-angle displays",
  }

  const formatSpec = formatSpecs[format] || formatSpecs.equirectangular

  // Enhanced panorama prompt with format-specific handling
  const panoramaPrompt = `${basePrompt}, 360-DEGREE PANORAMIC TRANSFORMATION: Convert this artwork into a complete 360-degree panoramic composition using ${format.toUpperCase()} FORMAT with ${formatSpec}, ${resolution} ultra-high resolution with immersive environmental mapping and full spherical coverage, panoramic distortion correction for ${format} format, VR-ready composition optimized for virtual reality headsets and panoramic display systems, seamless 360-degree horizontal coverage with enhanced peripheral detail${perspectiveText}, complete wraparound visual experience with proper ${format} mapping`

  console.log(`🌐 Generated panorama prompt length: ${panoramaPrompt.length} characters`)
  console.log(`🌐 Format applied: ${format}`)

  return panoramaPrompt
}
