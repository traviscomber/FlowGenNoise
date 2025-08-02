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
  return `${basePrompt}, TUNNEL UP DOME PROJECTION: Transform this artwork into a ${diameter}m planetarium dome projection with dramatic TUNNEL UP perspective effect, fisheye lens distortion creating immersive upward-looking view perfect for dome ceiling display, ${resolution} resolution optimized for planetarium projection systems, spherical mapping with zenith focus point, radial symmetry expanding outward from center, immersive 180-degree field of view, dome-optimized composition with enhanced peripheral detail, planetarium-grade visual quality with seamless edge blending, astronomical projection standards, fulldome cinema format, immersive overhead viewing experience, TUNNEL UP effect creating sense of looking up through a cosmic tunnel, dramatic perspective distortion for dome ceiling projection`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const perspectiveText = perspective ? `, ${perspective} perspective` : ""
  return `${basePrompt}, 360-DEGREE PANORAMIC VIEW: Transform this artwork into a complete 360-degree panoramic composition, ${format} projection mapping for VR and immersive displays, ${resolution} resolution with seamless horizontal wrapping, spherical panoramic format suitable for VR headsets and 360-degree viewers, immersive environmental mapping, full spherical coverage with no visible seams, panoramic distortion correction for equirectangular format, VR-ready composition with proper aspect ratio, 360-degree environmental storytelling, immersive wraparound visual experience${perspectiveText}, optimized for virtual reality and panoramic display systems`
}
