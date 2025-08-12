export async function callOpenAI(
  prompt: string,
  options?: { size?: "256x256" | "512x512" | "1024x1024" | "1792x1024" | "1024x1792"; quality?: "standard" | "hd" },
): Promise<string> {
  const maxRetries = 3
  const baseDelay = 2000 // 2 seconds
  const size = options?.size || "1024x1024"
  const quality = options?.quality || "hd"

  // Validate size parameter for DALL-E 3
  const validSizes = ["1024x1024", "1792x1024", "1024x1792"]
  if (!validSizes.includes(size)) {
    console.warn(`⚠️ Invalid size ${size}, defaulting to 1024x1024`)
    options = { ...options, size: "1024x1024" }
  }

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)
      console.log(`📐 Image size: ${size}`)

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
          size: size,
          quality: quality,
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

export function generateDomePrompt(basePrompt: string, diameter: number, resolution: string, projectionType: string) {
  const domeSpecs = `Professional planetarium dome projection for ${diameter}m fulldome theater, ${resolution} resolution, ${projectionType} projection mapping. `
  const domeInstructions = `Create a perfect circular fisheye view optimized for dome projection. The image must be perfectly circular with rich content distributed evenly across the hemisphere. Design for overhead planetarium viewing with immersive detail extending to the dome edges. Ensure proper fisheye distortion with zenith at center and horizon at circle edge. Professional fulldome cinema quality. `

  return domeSpecs + domeInstructions + basePrompt
}

export function generatePanoramaPrompt(basePrompt: string, resolution: string, format: string, perspective?: string) {
  let formatInstructions = ""

  switch (format) {
    case "equirectangular":
      formatInstructions = `PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA: Create a seamless 360-degree panoramic image with PERFECT HORIZONTAL WRAPPING. CRITICAL: The left edge must connect seamlessly with the right edge when wrapped around a sphere - NO VISIBLE SEAMS, NO DISCONTINUITIES, NO EDGE ARTIFACTS. 

TECHNICAL SPECIFICATIONS:
- Horizontal field of view: Complete 360° with seamless wraparound
- Vertical field of view: 180° from zenith to nadir
- Projection: Equirectangular mapping with proper spherical distortion
- Edge continuity: Left and right edges must be identical when wrapped
- Horizon placement: Horizontal line across the middle of the image
- Polar stretching: Natural equirectangular distortion toward top/bottom edges
- VR compatibility: Optimized for VR headsets and 360° viewers

SEAMLESS WRAPPING REQUIREMENTS:
- Content must flow continuously from right edge to left edge
- No objects cut off at the edges - they must wrap around naturally
- Lighting and shadows must be consistent across the wrap point
- Color gradients must transition smoothly across edges
- Architectural elements must align perfectly when wrapped
- Sky and ground elements must connect seamlessly

PROFESSIONAL QUALITY:
- Ultra-high detail suitable for VR immersion
- Consistent lighting throughout the 360° environment
- Rich environmental storytelling in all directions
- Professional photography-grade composition
- Suitable for commercial VR applications

`
      break
    case "stereographic":
      formatInstructions = `Professional ${perspective || "little-planet"} stereographic projection. `
      if (perspective === "little-planet") {
        formatInstructions += `Create a perfect "tiny planet" effect with the ground curved into a miniature sphere at the bottom and sky surrounding it. Ensure perfect circular symmetry and seamless curvature. `
      } else if (perspective === "tunnel") {
        formatInstructions += `Create a dramatic tunnel effect with content curving inward toward the center point. Maintain perfect radial symmetry. `
      } else {
        formatInstructions += `Create a professional fisheye circular view with extreme wide-angle distortion and perfect circular boundary. `
      }
      break
    case "cubemap":
      formatInstructions = `Professional cubemap projection with six seamless faces for real-time 3D rendering. Each face must align perfectly with adjacent faces. `
      break
    case "cylindrical":
      formatInstructions = `Professional cylindrical panoramic projection with seamless horizontal 360° wrapping and natural vertical perspective. `
      break
  }

  return formatInstructions + basePrompt
}
