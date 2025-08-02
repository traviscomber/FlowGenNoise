export async function callOpenAI(prompt: string, timeoutMs = 15000): Promise<string> {
  console.log(`🤖 OpenAI API call starting`)
  console.log(`📝 Prompt length: ${prompt.length} characters`)
  console.log(`⏱️ Timeout: ${timeoutMs}ms`)

  const maxRetries = 2
  let lastError: any

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🔄 Attempt ${attempt}/${maxRetries}`)

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
          prompt: prompt.length > 4000 ? prompt.substring(0, 4000) + "..." : prompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`📡 OpenAI API response status: ${response.status}`)
      console.log(`📡 Response headers:`, Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let errorMessage = `HTTP ${response.status}`

        try {
          if (contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error?.message || errorData.message || errorMessage
          } else {
            // Handle HTML error pages
            const errorText = await response.text()
            console.log(`📄 Error response (first 200 chars):`, errorText.substring(0, 200))

            if (errorText.includes("503") || errorText.includes("Service Unavailable")) {
              errorMessage = "OpenAI service temporarily unavailable (503)"
            } else if (errorText.includes("502") || errorText.includes("Bad Gateway")) {
              errorMessage = "OpenAI gateway error (502)"
            } else if (errorText.includes("504") || errorText.includes("Gateway Timeout")) {
              errorMessage = "OpenAI gateway timeout (504)"
            } else if (errorText.includes("429") || errorText.includes("Too Many Requests")) {
              errorMessage = "OpenAI rate limit exceeded (429)"
            } else {
              errorMessage = `OpenAI API error: ${response.status}`
            }
          }
        } catch (parseError) {
          console.error(`❌ Failed to parse error response:`, parseError)
          errorMessage = `OpenAI API error: ${response.status} (unparseable response)`
        }

        console.error(`❌ OpenAI API error:`, errorMessage)

        // Retry on server errors (5xx) and rate limits (429)
        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 2s, 4s
            console.log(`⏳ Retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
        }

        throw new Error(errorMessage)
      }

      // Parse response
      let responseData
      try {
        const responseText = await response.text()
        console.log(`📄 Response text (first 200 chars):`, responseText.substring(0, 200))
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error(`❌ Failed to parse JSON response:`, parseError)
        throw new Error("Invalid JSON response from OpenAI API")
      }

      if (!responseData?.data?.[0]?.url) {
        console.error(`❌ Invalid response structure:`, responseData)
        throw new Error("Invalid response structure from OpenAI API")
      }

      const imageUrl = responseData.data[0].url
      console.log(`✅ OpenAI API success on attempt ${attempt}`)
      return imageUrl
    } catch (error: any) {
      lastError = error
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error.message)

      if (error.name === "AbortError") {
        throw new Error("DEPLOYMENT_TIMEOUT")
      }

      // Don't retry on client errors (4xx) except 429
      if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403")) {
        throw error
      }

      // Retry on network errors and server errors
      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
    }
  }

  // All retries failed
  throw lastError || new Error("All retry attempts failed")
}

export function generateUltraSimplePrompt(basePrompt: string): string {
  // For very long GODLEVEL prompts, use them as-is but with length limit
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    console.log(`📏 GODLEVEL prompt detected: ${basePrompt.length} characters`)
    return basePrompt.length > 4000 ? basePrompt.substring(0, 4000) + "..." : basePrompt
  }

  // Extract only the most essential keywords for simple prompts
  const words = basePrompt.split(/[,\s]+/).filter((word) => word.length > 3)
  const keyWords = words.slice(0, 20) // Only first 20 meaningful words
  const ultraSimple = keyWords.join(" ")

  console.log(`📏 Ultra-simplified prompt: ${ultraSimple.length} characters`)
  return ultraSimple + ", highly detailed, 8K"
}

export async function generateSingleImageOnly(prompt: string): Promise<{
  mainImage: string
  domeImage: string
  panoramaImage: string
  method: string
  errors: string[]
}> {
  console.log("🚀 Single image only generation - maximum speed mode")

  try {
    // For GODLEVEL prompts, use longer timeout
    const isGodLevel = prompt.includes("GODLEVEL PROMPT:")
    const timeout = isGodLevel ? 25000 : 12000 // 25s for GODLEVEL, 12s for simple

    console.log(`⏱️ Using ${timeout / 1000}s timeout for ${isGodLevel ? "GODLEVEL" : "simple"} prompt`)

    const processedPrompt = isGodLevel ? prompt : generateUltraSimplePrompt(prompt)
    const image = await callOpenAI(processedPrompt, timeout)

    return {
      mainImage: image,
      domeImage: image, // Use same image for all formats in single mode
      panoramaImage: image,
      method: isGodLevel ? "single_godlevel" : "single_ultra_fast",
      errors: [],
    }
  } catch (error: any) {
    console.error("❌ Single image generation failed:", error.message)
    throw new Error(`Single image generation failed: ${error.message}`)
  }
}

export function generateDomePrompt(basePrompt: string): string {
  // For GODLEVEL prompts, create proper dome-formatted version
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    // Extract the core content after "GODLEVEL PROMPT: "
    const coreContent = basePrompt.replace("GODLEVEL PROMPT: ", "")

    // Create dome-specific version with proper formatting instructions
    return `PLANETARIUM DOME FISHEYE PROJECTION: ${coreContent.substring(0, 3500)}, CRITICAL FORMATTING: extreme fisheye lens distortion with 180-degree field of view, circular frame with black borders, center point represents zenith directly overhead, edges curve dramatically toward horizon, spherical mapping for dome ceiling projection, immersive overhead viewing experience optimized for planetarium dome display, curved perspective with radial distortion from center outward, celestial dome atmosphere with zenith focus point`
  }

  const simple = generateUltraSimplePrompt(basePrompt)
  return `PLANETARIUM DOME FISHEYE: ${simple}, extreme fisheye lens distortion, 180-degree circular view, center zenith overhead, curved dome projection, black circular border`
}

export function generatePanoramaPrompt(basePrompt: string): string {
  // For GODLEVEL prompts, create proper panorama-formatted version
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    // Extract the core content after "GODLEVEL PROMPT: "
    const coreContent = basePrompt.replace("GODLEVEL PROMPT: ", "")

    // Create panorama-specific version with proper formatting instructions
    return `360-DEGREE EQUIRECTANGULAR PANORAMA: ${coreContent.substring(0, 3500)}, CRITICAL FORMATTING: complete 360-degree horizontal view in equirectangular projection format, rectangular aspect ratio 2:1 width to height, seamless left-right wrapping edges, distorted perspective with stretched poles, optimized for VR headset viewing, spherical environment mapping, immersive surround experience with full horizontal rotation, equirectangular coordinate system for virtual reality display`
  }

  const simple = generateUltraSimplePrompt(basePrompt)
  return `360-DEGREE EQUIRECTANGULAR PANORAMA: ${simple}, complete 360-degree horizontal view, rectangular 2:1 aspect ratio, seamless wrapping edges, VR headset format, equirectangular projection`
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
  console.log("⚡ Attempting parallel generation with format-specific prompts...")

  const isGodLevel = mainPrompt.includes("GODLEVEL PROMPT:")
  const isAsmat = mainPrompt.includes("Asmat people")

  // Extended timeouts for GODLEVEL prompts
  const mainTimeout = isGodLevel ? (isAsmat ? 20000 : 18000) : 12000 // 20s for Asmat, 18s for other GODLEVEL, 12s for simple
  const domeTimeout = isGodLevel ? (isAsmat ? 22000 : 20000) : 14000 // 22s for Asmat dome, 20s for other GODLEVEL dome, 14s for simple
  const panoramaTimeout = isGodLevel ? (isAsmat ? 22000 : 20000) : 14000 // 22s for Asmat panorama, 20s for other GODLEVEL panorama, 14s for simple

  console.log(
    `⏱️ Using timeouts: Main=${mainTimeout / 1000}s, Dome=${domeTimeout / 1000}s, Panorama=${panoramaTimeout / 1000}s`,
  )

  // Log the specific prompts being used
  console.log("🎯 Main prompt:", mainPrompt.substring(0, 150) + "...")
  console.log("🏛️ Dome prompt:", domePrompt.substring(0, 150) + "...")
  console.log("🌐 Panorama prompt:", panoramaPrompt.substring(0, 150) + "...")

  const results = await Promise.allSettled([
    callOpenAI(mainPrompt, mainTimeout),
    callOpenAI(domePrompt, domeTimeout),
    callOpenAI(panoramaPrompt, panoramaTimeout),
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
    console.log("✅ Main image generated")
  } else {
    response.errors.push(`Main: ${results[0].reason.message}`)
    console.error("❌ Main image failed:", results[0].reason.message)
  }

  if (results[1].status === "fulfilled") {
    response.domeImage = results[1].value
    console.log("✅ Dome image generated with fisheye formatting")
  } else {
    response.errors.push(`Dome: ${results[1].reason.message}`)
    console.error("❌ Dome image failed:", results[1].reason.message)
  }

  if (results[2].status === "fulfilled") {
    response.panoramaImage = results[2].value
    console.log("✅ Panorama image generated with equirectangular formatting")
  } else {
    response.errors.push(`Panorama: ${results[2].reason.message}`)
    console.error("❌ Panorama image failed:", results[2].reason.message)
  }

  return response
}
