// Robust OpenAI call with timeout + explicit stereographic prompt support.

export async function callOpenAI(prompt: string): Promise<string> {
  const maxRetries = 3
  const baseDelay = 2000 // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)

      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minute timeout

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 3900 ? prompt.substring(0, 3900) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      console.log(`📡 OpenAI API response status: ${response.status}`)

      const responseText = await response.text()
      console.log(`📄 Response text preview: ${responseText.substring(0, 200)}...`)

      let responseData: any
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError: any) {
        console.error(`❌ JSON parsing failed:`, parseError.message)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error(`❌ OpenAI API error response:`, responseData)

        const shouldRetry = response.status >= 500 || response.status === 429 || response.status === 503
        if (shouldRetry && attempt < maxRetries) {
          const delay =
            response.status === 429
              ? baseDelay * Math.pow(2, attempt) * 2
              : baseDelay * Math.pow(2, attempt - 1)

          console.log(`⏳ Retrying in ${delay}ms due to ${response.status} error...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`)
      }

      if (!responseData?.data?.[0]?.url) {
        console.error(`❌ Invalid response structure:`, responseData)
        throw new Error("Invalid response structure: missing image URL")
      }

      const imageUrl = responseData.data[0].url
      console.log(`✅ OpenAI API success: ${imageUrl.substring(0, 50)}...`)
      return imageUrl
    } catch (error: any) {
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error.message)

      if (error.name === "AbortError") {
        console.error("❌ Request timed out")
        if (attempt === maxRetries) {
          throw new Error("OpenAI API request timed out after 2 minutes")
        }
      }

      if (
        error.message.includes("Invalid JSON") ||
        error.message.includes("400") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw error
      }

      if (attempt === maxRetries) {
        throw new Error(`OpenAI API call failed after ${maxRetries} attempts: ${error.message}`)
      }

      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("OpenAI API call failed: Maximum retries exceeded")
}

// Dome prompt (kept as-is, already emphasizes tunnel-up fisheye)
export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "4K",
  projectionType = "fisheye",
): string {
  return `${basePrompt}, TUNNEL UP DOME PROJECTION: Transform this artwork into a ${diameter}m planetarium dome projection with dramatic TUNNEL UP perspective effect, ${projectionType} lens distortion creating immersive upward-looking view perfect for dome ceiling display, ${resolution} resolution optimized for planetarium projection systems, spherical mapping with zenith focus point, radial symmetry expanding outward from center, immersive 180-degree field of view, dome-optimized composition with enhanced peripheral detail, planetarium-grade visual quality with seamless edge blending, fulldome cinema format, immersive overhead viewing experience`
}

// Explicit stereographic modes for 360 panoramas
export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const fmt = (format || "").toLowerCase()
  const persp = (perspective || "").toLowerCase()

  let prompt =
    `${basePrompt}, 360-DEGREE PANORAMIC VIEW: Transform this artwork into a complete 360-degree panoramic composition, ` +
    `${fmt} projection mapping for VR and immersive displays, ${resolution} resolution with seamless horizontal wrapping, ` +
    `full spherical coverage with no visible seams, panoramic distortion correction, VR-ready composition with proper aspect ratio, ` +
    `immersive wraparound environmental storytelling`

  if (fmt === "stereographic") {
    // Strong, explicit stereographic directives for the model:
    if (persp === "little-planet") {
      prompt += `,
STEREOGRAPHIC LITTLE PLANET: render as a "tiny planet" with the horizon forming a perfect circle around the frame, ground wrapping outward and sky concentrated toward the center, extreme wide-angle stereographic projection, pronounced curvature of edges, zenith-focused view, distinctive miniature-planet illusion, crisp radial mapping with high peripheral detail, balanced center compression characteristic of little-planet photography, avoid seams; authoritative tiny-planet look`
    } else if (persp === "tunnel") {
      prompt += `,
STEREOGRAPHIC TUNNEL: render as a stereographic "tunnel" projection with the scene wrapping inward toward the center like a vortex, sky and environment curving into a cylindrical tunnel, strong inward curvature and central pull, extreme wide-angle stereographic mapping, clean circular symmetry, continuous wrap with no seams, authoritative tunnel-vision look`
    } else if (persp === "fisheye") {
      prompt += `,
STEREOGRAPHIC FISHEYE: circular frame with pronounced barrel distortion, edges bending strongly, center appearing more natural, extreme wide-angle stereographic mapping, maintain a clean circular boundary, no seams`
    } else if (persp) {
      // Custom text, but still reinforce stereographic mode:
      prompt += `,
ADVANCED STEREOGRAPHIC MODE: apply stereographic projection with "${perspective}" perspective emphasis, extreme wide-angle, strong curvature, clean circular symmetry, no seams`
    } else {
      // Generic stereographic if no perspective given
      prompt += `,
STEREOGRAPHIC PROJECTION: extreme wide-angle curved mapping, circular symmetry, clean edges, no seams`
    }
  } else {
    // Non-stereographic formats keep generic guidance (equirectangular/cubemap/etc.)
    prompt += persp ? `, ${persp} perspective` : ""
  }

  return prompt
}
