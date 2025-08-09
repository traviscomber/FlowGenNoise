export async function callOpenAI(
  prompt: string,
  options?: { size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"; quality?: "standard" | "hd" },
): Promise<string> {
  const maxRetries = 3
  const baseDelay = 2000 // 2 seconds
  const size = options?.size || "1024x1024"
  const quality = options?.quality || "standard"

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)

      // Create AbortController for timeout
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
          size, // use requested size
          quality, // use requested quality
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
            response.status === 429 ? baseDelay * Math.pow(2, attempt) * 2 : baseDelay * Math.pow(2, attempt - 1)

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

export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "4K",
  projectionType = "fisheye",
): string {
  return `${basePrompt}, TUNNEL UP DOME PROJECTION: Transform this artwork into a ${diameter}m planetarium dome projection with dramatic TUNNEL UP perspective effect, ${projectionType} lens distortion creating immersive upward-looking view perfect for dome ceiling display, ${resolution} resolution optimized for planetarium projection systems, spherical mapping with zenith focus point, radial symmetry expanding outward from center, immersive 180-degree field of view, dome-optimized composition with enhanced peripheral detail, planetarium-grade visual quality with seamless edge blending, astronomical projection standards, fulldome cinema format, immersive overhead viewing experience, TUNNEL UP effect creating sense of looking up through a cosmic tunnel, dramatic perspective distortion for dome ceiling projection`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const fmt = (format || "").toLowerCase()
  const persp = (perspective || "").toLowerCase()

  let prompt = `${basePrompt}, 360-DEGREE PANORAMIC VIEW: Transform this artwork into a complete 360-degree panoramic composition`

  if (fmt === "equirectangular") {
    prompt += `, EQUIRECTANGULAR PROJECTION FORMAT: rendered in proper equirectangular mapping with EXACT 2:1 aspect ratio where WIDTH IS TWICE THE HEIGHT (for example 2048x1024 or 4096x2048), horizontal field of view spanning complete 360 degrees, vertical field of view covering full 180 degrees from zenith to nadir, characteristic equirectangular distortion where polar regions are stretched horizontally across the entire width, seamless horizontal wrapping at 0°/360° longitude meridian, proper spherical coordinate mapping, sky occupying upper half with progressive horizontal stretching toward poles, ground/nadir region in lower portion with corresponding polar stretching, NO VERTICAL SEAMS at edges, continuous horizontal wrap, optimized for VR headsets and 360° viewers, ${resolution} resolution with MANDATORY 2:1 WIDTH-TO-HEIGHT RATIO, immersive spherical environment suitable for virtual reality consumption`
  } else if (fmt === "stereographic") {
    if (persp === "little-planet") {
      prompt += `, STEREOGRAPHIC LITTLE PLANET: render as a "tiny planet" with the horizon forming a perfect circle around the frame, ground wrapping outward and sky concentrated toward the center, extreme wide-angle stereographic projection, pronounced curvature of edges, zenith-focused view, distinctive miniature-planet illusion, crisp radial mapping with high peripheral detail, balanced center compression characteristic of little-planet photography, avoid seams, authoritative tiny-planet look`
    } else if (persp === "tunnel") {
      prompt += `, STEREOGRAPHIC TUNNEL: render as a stereographic "tunnel" projection with the scene wrapping inward toward the center like a vortex, sky and environment curving into a cylindrical tunnel, strong inward curvature and central pull, extreme wide-angle stereographic mapping, clean circular symmetry, continuous wrap with no seams, authoritative tunnel-vision look`
    } else if (persp === "fisheye") {
      prompt += `, STEREOGRAPHIC FISHEYE: circular frame with pronounced barrel distortion, edges bending strongly, center appearing more natural, extreme wide-angle stereographic mapping, maintain a clean circular boundary, no seams`
    } else {
      prompt += `, STEREOGRAPHIC PROJECTION: extreme wide-angle curved mapping, circular symmetry, clean edges, no seams`
    }
  } else if (fmt === "cubemap") {
    prompt += `, CUBEMAP FORMAT: six square faces arranged for cube mapping (front, back, left, right, up, down), each face covering 90° field of view, seamless edges between adjacent faces, suitable for real-time 3D rendering and game engines`
  } else if (fmt === "cylindrical") {
    prompt += `, CYLINDRICAL PROJECTION: horizontal 360° wrap with minimal vertical distortion, maintaining natural vertical perspective, suitable for architectural and landscape panoramas`
  }

  prompt += `, ${resolution} resolution, immersive environmental storytelling, VR-ready composition, optimized for virtual reality and panoramic display systems`

  return prompt
}
