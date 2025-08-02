export async function callOpenAI(prompt: string, timeoutMs = 30000): Promise<string> {
  const maxRetries = 1 // Reduced to 1 retry to prevent timeout
  const baseDelay = 500 // Reduced delay

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)
      console.log(`⏱️ Timeout set to: ${timeoutMs}ms`)

      // Create abort controller for manual timeout control
      const controller = new AbortController()
      const timeoutId = setTimeout(() => {
        controller.abort()
        console.log(`⏰ Manual timeout triggered after ${timeoutMs}ms`)
      }, timeoutMs)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt.length > 4000 ? prompt.substring(0, 4000) + "..." : prompt, // Truncate long prompts
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`📡 OpenAI API response status: ${response.status}`)

      // Get response text first to handle non-JSON responses
      const responseText = await response.text()
      console.log(`📄 Response text preview: ${responseText.substring(0, 200)}...`)

      // Handle timeout and deployment errors specifically
      if (
        responseText.includes("FUNCTION_INVOCATION_TIMEOUT") ||
        responseText.includes("An error occurred with your deployment") ||
        responseText.includes("timeout") ||
        responseText.includes("exceeded time limit")
      ) {
        throw new Error("DEPLOYMENT_TIMEOUT")
      }

      // Check if response is JSON
      let responseData
      try {
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

        // Don't retry on client errors or deployment timeouts
        if (response.status < 500 && response.status !== 429) {
          throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`)
        }

        // Only retry on server errors and rate limits
        if (attempt < maxRetries) {
          const delay = response.status === 429 ? baseDelay * 2 : baseDelay
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

      // Handle specific timeout errors
      if (error.name === "AbortError" || error.message.includes("DEPLOYMENT_TIMEOUT")) {
        throw new Error("DEPLOYMENT_TIMEOUT")
      }

      // Don't retry on certain errors
      if (
        error.message.includes("Invalid JSON") ||
        error.message.includes("400") ||
        error.message.includes("401") ||
        error.message.includes("403") ||
        error.message.includes("DEPLOYMENT_TIMEOUT")
      ) {
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`OpenAI API call failed after ${maxRetries} attempts: ${error.message}`)
      }

      // Wait before retrying
      const delay = baseDelay
      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("OpenAI API call failed: Maximum retries exceeded")
}

export function generateOptimizedPrompt(basePrompt: string, maxLength = 3500): string {
  // Optimize prompt length while preserving key elements
  if (basePrompt.length <= maxLength) {
    return basePrompt
  }

  console.log(`📏 Optimizing prompt from ${basePrompt.length} to ~${maxLength} characters`)

  // Extract key elements
  const godLevelMatch = basePrompt.match(/GODLEVEL PROMPT: ([^,]+)/i)
  const colorMatch = basePrompt.match(
    /(vibrant|plasma|quantum|cosmic|thermal|spectral|crystalline|bioluminescent|aurora|metallic|prismatic|monochromatic|infrared|lava|futuristic|forest|ocean|sunset|arctic|neon|vintage|toxic|ember|lunar|tidal) [^,]+/i,
  )
  const qualityMatch = basePrompt.match(
    /(highly detailed|artistic masterpiece|professional photography|8K resolution|stunning visual composition)/i,
  )

  // Build optimized prompt
  let optimized = ""

  if (godLevelMatch) {
    optimized += godLevelMatch[1].substring(0, maxLength * 0.7) + ", "
  } else {
    optimized += basePrompt.substring(0, maxLength * 0.7) + ", "
  }

  if (colorMatch) {
    optimized += colorMatch[0] + ", "
  }

  if (qualityMatch) {
    optimized += qualityMatch[0]
  }

  // Ensure we don't exceed max length
  if (optimized.length > maxLength) {
    optimized = optimized.substring(0, maxLength - 3) + "..."
  }

  console.log(`✅ Optimized prompt length: ${optimized.length} characters`)
  return optimized
}

export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "4K",
  projectionType = "fisheye",
): string {
  const optimizedBase = generateOptimizedPrompt(basePrompt, 2500)

  return `DOME PROJECTION: ${optimizedBase}

DOME SPECS: ${diameter}m planetarium dome, ${resolution} resolution, ${projectionType} projection, TUNNEL UP perspective, fisheye distortion, spherical mapping, radial symmetry, dome ceiling display, immersive overhead viewing, dramatic upward perspective, concentric patterns from center, enhanced peripheral detail, planetarium-grade quality`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const optimizedBase = generateOptimizedPrompt(basePrompt, 2500)
  const perspectiveText = perspective ? `, ${perspective} perspective` : ""

  return `360 PANORAMA: ${optimizedBase}

PANORAMA SPECS: Complete 360-degree panoramic composition, ${format} projection, ${resolution} resolution, seamless horizontal wrapping, spherical coverage, VR-ready format, immersive environmental mapping, wraparound experience${perspectiveText}, optimized for VR headsets, continuous viewing, enhanced peripheral vision`
}

export async function generateSingleImage(prompt: string): Promise<string> {
  console.log("🖼️ Single image mode - generating main image only")
  return await callOpenAI(prompt, 25000) // Shorter timeout for single image
}

export async function generateImagesWithQueue(
  mainPrompt: string,
  domePrompt: string,
  panoramaPrompt: string,
): Promise<{
  mainImage?: string
  domeImage?: string
  panoramaImage?: string
  errors: string[]
  method: string
}> {
  console.log("🔄 Queue-based generation starting...")
  const results = {
    mainImage: undefined as string | undefined,
    domeImage: undefined as string | undefined,
    panoramaImage: undefined as string | undefined,
    errors: [] as string[],
    method: "queue",
  }

  // Queue with priority: main -> dome -> panorama
  const queue = [
    { type: "main", prompt: mainPrompt, timeout: 25000 },
    { type: "dome", prompt: domePrompt, timeout: 20000 },
    { type: "panorama", prompt: panoramaPrompt, timeout: 20000 },
  ]

  for (const item of queue) {
    try {
      console.log(`🎯 Generating ${item.type} image...`)
      const image = await callOpenAI(item.prompt, item.timeout)

      if (item.type === "main") {
        results.mainImage = image
        console.log(`✅ Main image generated successfully`)
      } else if (item.type === "dome") {
        results.domeImage = image
        console.log(`✅ Dome image generated successfully`)
      } else if (item.type === "panorama") {
        results.panoramaImage = image
        console.log(`✅ Panorama image generated successfully`)
      }
    } catch (error: any) {
      console.error(`❌ ${item.type} image failed:`, error.message)
      results.errors.push(`${item.type}: ${error.message}`)

      // If main image fails, stop the queue
      if (item.type === "main") {
        throw new Error(`Main image generation failed: ${error.message}`)
      }

      // For dome/panorama failures, use main image as fallback if available
      if (results.mainImage) {
        if (item.type === "dome") {
          results.domeImage = results.mainImage
          console.log(`🔄 Using main image as dome fallback`)
        } else if (item.type === "panorama") {
          results.panoramaImage = results.mainImage
          console.log(`🔄 Using main image as panorama fallback`)
        }
      }
    }
  }

  return results
}

export async function generateImagesInParallel(
  mainPrompt: string,
  domePrompt: string,
  panoramaPrompt: string,
): Promise<{
  mainImage?: string
  domeImage?: string
  panoramaImage?: string
  errors: string[]
}> {
  console.log("⚡ Parallel generation with reduced timeouts...")

  const results = await Promise.allSettled([
    callOpenAI(mainPrompt, 20000), // 20 second timeout
    callOpenAI(domePrompt, 15000), // 15 second timeout
    callOpenAI(panoramaPrompt, 15000), // 15 second timeout
  ])

  const response = {
    mainImage: undefined as string | undefined,
    domeImage: undefined as string | undefined,
    panoramaImage: undefined as string | undefined,
    errors: [] as string[],
  }

  // Process results
  if (results[0].status === "fulfilled") {
    response.mainImage = results[0].value
    console.log("✅ Main image generated successfully")
  } else {
    response.errors.push(`Main image: ${results[0].reason.message}`)
    console.error("❌ Main image failed:", results[0].reason.message)
  }

  if (results[1].status === "fulfilled") {
    response.domeImage = results[1].value
    console.log("✅ Dome image generated successfully")
  } else {
    response.errors.push(`Dome image: ${results[1].reason.message}`)
    console.error("❌ Dome image failed:", results[1].reason.message)
  }

  if (results[2].status === "fulfilled") {
    response.panoramaImage = results[2].value
    console.log("✅ Panorama image generated successfully")
  } else {
    response.errors.push(`Panorama image: ${results[2].reason.message}`)
    console.error("❌ Panorama image failed:", results[2].reason.message)
  }

  return response
}
