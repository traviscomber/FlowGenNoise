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

      // Clean prompt to avoid text/numbers in images
      const cleanPrompt = cleanPromptForImageGeneration(prompt)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: cleanPrompt.length > 4000 ? cleanPrompt.substring(0, 4000) + "..." : cleanPrompt,
          n: 1,
          size: "1024x1024",
          quality: "standard",
          response_format: "url",
        }),
        signal: controller.signal,
      })

      clearTimeout(timeoutId)
      console.log(`📡 OpenAI API response status: ${response.status}`)

      if (!response.ok) {
        const contentType = response.headers.get("content-type") || ""
        let errorMessage = `HTTP ${response.status}`

        try {
          if (contentType.includes("application/json")) {
            const errorData = await response.json()
            errorMessage = errorData.error?.message || errorData.message || errorMessage
          } else {
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

        if (response.status >= 500 || response.status === 429) {
          if (attempt < maxRetries) {
            const delay = Math.pow(2, attempt) * 1000
            console.log(`⏳ Retrying in ${delay}ms...`)
            await new Promise((resolve) => setTimeout(resolve, delay))
            continue
          }
        }

        throw new Error(errorMessage)
      }

      let responseData
      try {
        const responseText = await response.text()
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

      if (error.message.includes("400") || error.message.includes("401") || error.message.includes("403")) {
        throw error
      }

      if (attempt < maxRetries) {
        const delay = Math.pow(2, attempt) * 1000
        console.log(`⏳ Retrying in ${delay}ms...`)
        await new Promise((resolve) => setTimeout(resolve, delay))
        continue
      }
    }
  }

  throw lastError || new Error("All retry attempts failed")
}

// Clean prompt to avoid text/numbers in generated images
export function cleanPromptForImageGeneration(prompt: string): string {
  let cleanPrompt = prompt

  const noTextInstructions =
    ", NO TEXT, NO NUMBERS, NO FONTS, NO LETTERS, NO WORDS, NO CAPTIONS, NO LABELS, pure visual imagery only, no written elements, no typography, no numerical displays, no textual overlays"

  cleanPrompt = cleanPrompt.replace(
    /\b(text|font|number|letter|word|caption|label|title|heading)\b/gi,
    "visual element",
  )
  cleanPrompt = cleanPrompt.replace(/\b(write|written|writing|display|show|label)\b/gi, "visualize")

  return cleanPrompt + noTextInstructions
}

// Generate mathematical data for dome projection
export function generateMathematicalDomeData(
  width = 1024,
  height = 1024,
): {
  coordinates: Array<{ x: number; y: number; u: number; v: number; valid: boolean }>
  centerX: number
  centerY: number
  radius: number
} {
  console.log("🧮 Generating mathematical dome projection data...")

  const centerX = width / 2
  const centerY = height / 2
  const radius = Math.min(width, height) * 0.4 // 40% of canvas for dome

  const coordinates = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX
      const dy = y - centerY
      const distance = Math.sqrt(dx * dx + dy * dy)

      if (distance <= radius) {
        // Fisheye mathematical transformation
        const angle = Math.atan2(dy, dx)
        const r = distance / radius

        // Mathematical fisheye projection: r' = sin(r * π/2)
        const fisheyeR = Math.sin((r * Math.PI) / 2)

        // Convert back to Cartesian coordinates for source mapping
        const sourceR = fisheyeR * radius
        const sourceX = centerX + sourceR * Math.cos(angle)
        const sourceY = centerY + sourceR * Math.sin(angle)

        // Normalize to UV coordinates (0-1 range)
        const u = sourceX / width
        const v = sourceY / height

        coordinates.push({
          x,
          y,
          u: Math.max(0, Math.min(1, u)),
          v: Math.max(0, Math.min(1, v)),
          valid: true,
        })
      } else {
        // Outside dome area - black/transparent
        coordinates.push({
          x,
          y,
          u: 0,
          v: 0,
          valid: false,
        })
      }
    }
  }

  console.log(`✅ Generated ${coordinates.filter((c) => c.valid).length} valid dome coordinates`)
  return { coordinates, centerX, centerY, radius }
}

// Generate mathematical data for equirectangular panorama
export function generateMathematicalPanoramaData(
  width = 2048,
  height = 1024,
): {
  coordinates: Array<{ x: number; y: number; u: number; v: number; longitude: number; latitude: number }>
} {
  console.log("🧮 Generating mathematical panorama projection data...")

  const coordinates = []

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Convert pixel coordinates to longitude/latitude
      const longitude = (x / width) * 2 * Math.PI - Math.PI // -π to π
      const latitude = (y / height) * Math.PI - Math.PI / 2 // -π/2 to π/2

      // Convert spherical coordinates to Cartesian
      const cartX = Math.cos(latitude) * Math.cos(longitude)
      const cartY = Math.cos(latitude) * Math.sin(longitude)
      const cartZ = Math.sin(latitude)

      // Project to perspective view (mathematical transformation)
      const projX = Math.atan2(cartY, cartX)
      const projY = Math.atan2(cartZ, Math.sqrt(cartX * cartX + cartY * cartY))

      // Convert to UV coordinates for source mapping
      const u = (projX + Math.PI) / (2 * Math.PI)
      const v = (projY + Math.PI / 2) / Math.PI

      coordinates.push({
        x,
        y,
        u: Math.max(0, Math.min(1, u)),
        v: Math.max(0, Math.min(1, v)),
        longitude,
        latitude,
      })
    }
  }

  console.log(`✅ Generated ${coordinates.length} panorama coordinates`)
  return { coordinates }
}

// Create dome image from mathematical data and source image
export async function createDomeFromMathematicalData(imageUrl: string): Promise<string> {
  try {
    console.log("🏛️ Creating dome projection from mathematical data...")

    // Fetch the source image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()

    // Create canvas for dome projection
    const canvas = new OffscreenCanvas(1024, 1024)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")

    // Create source image
    const imageBlob = new Blob([imageBuffer])
    const imageBitmap = await createImageBitmap(imageBlob)

    // Generate mathematical dome data
    const domeData = generateMathematicalDomeData(1024, 1024)

    // Fill with black background
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, 1024, 1024)

    // Create ImageData for pixel manipulation
    const imageData = ctx.createImageData(1024, 1024)
    const data = imageData.data

    // Draw source image to temporary canvas to get pixel data
    const tempCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) throw new Error("Could not get temp canvas context")

    tempCtx.drawImage(imageBitmap, 0, 0)
    const sourceImageData = tempCtx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
    const sourceData = sourceImageData.data

    // Apply mathematical transformation pixel by pixel
    for (const coord of domeData.coordinates) {
      const targetIndex = (coord.y * 1024 + coord.x) * 4

      if (coord.valid) {
        // Map to source image coordinates
        const sourceX = Math.floor(coord.u * imageBitmap.width)
        const sourceY = Math.floor(coord.v * imageBitmap.height)
        const sourceIndex = (sourceY * imageBitmap.width + sourceX) * 4

        if (sourceIndex >= 0 && sourceIndex < sourceData.length - 3) {
          // Copy pixel data with mathematical transformation
          data[targetIndex] = sourceData[sourceIndex] // R
          data[targetIndex + 1] = sourceData[sourceIndex + 1] // G
          data[targetIndex + 2] = sourceData[sourceIndex + 2] // B
          data[targetIndex + 3] = 255 // A
        }
      } else {
        // Black pixel outside dome
        data[targetIndex] = 0 // R
        data[targetIndex + 1] = 0 // G
        data[targetIndex + 2] = 0 // B
        data[targetIndex + 3] = 255 // A
      }
    }

    // Put the transformed image data back to canvas
    ctx.putImageData(imageData, 0, 0)

    // Convert to blob and return URL
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 })
    const domeUrl = URL.createObjectURL(blob)

    console.log("✅ Dome projection created from mathematical data")
    return domeUrl
  } catch (error) {
    console.error("❌ Mathematical dome creation failed:", error)
    throw error
  }
}

// Create panorama image from mathematical data and source image
export async function createPanoramaFromMathematicalData(imageUrl: string): Promise<string> {
  try {
    console.log("🌐 Creating panorama projection from mathematical data...")

    // Fetch the source image
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }

    const imageBuffer = await response.arrayBuffer()

    // Create canvas for panorama projection (2:1 aspect ratio)
    const canvas = new OffscreenCanvas(2048, 1024)
    const ctx = canvas.getContext("2d")
    if (!ctx) throw new Error("Could not get canvas context")

    // Create source image
    const imageBlob = new Blob([imageBuffer])
    const imageBitmap = await createImageBitmap(imageBlob)

    // Generate mathematical panorama data
    const panoramaData = generateMathematicalPanoramaData(2048, 1024)

    // Create ImageData for pixel manipulation
    const imageData = ctx.createImageData(2048, 1024)
    const data = imageData.data

    // Draw source image to temporary canvas to get pixel data
    const tempCanvas = new OffscreenCanvas(imageBitmap.width, imageBitmap.height)
    const tempCtx = tempCanvas.getContext("2d")
    if (!tempCtx) throw new Error("Could not get temp canvas context")

    tempCtx.drawImage(imageBitmap, 0, 0)
    const sourceImageData = tempCtx.getImageData(0, 0, imageBitmap.width, imageBitmap.height)
    const sourceData = sourceImageData.data

    // Apply mathematical transformation pixel by pixel
    for (const coord of panoramaData.coordinates) {
      const targetIndex = (coord.y * 2048 + coord.x) * 4

      // Map to source image coordinates using mathematical transformation
      const sourceX = Math.floor(coord.u * imageBitmap.width)
      const sourceY = Math.floor(coord.v * imageBitmap.height)
      const sourceIndex = (sourceY * imageBitmap.width + sourceX) * 4

      if (sourceIndex >= 0 && sourceIndex < sourceData.length - 3) {
        // Copy pixel data with mathematical transformation
        data[targetIndex] = sourceData[sourceIndex] // R
        data[targetIndex + 1] = sourceData[sourceIndex + 1] // G
        data[targetIndex + 2] = sourceData[sourceIndex + 2] // B
        data[targetIndex + 3] = 255 // A
      } else {
        // Default color for unmapped areas
        data[targetIndex] = 0 // R
        data[targetIndex + 1] = 0 // G
        data[targetIndex + 2] = 0 // B
        data[targetIndex + 3] = 255 // A
      }
    }

    // Put the transformed image data back to canvas
    ctx.putImageData(imageData, 0, 0)

    // Convert to blob and return URL
    const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.9 })
    const panoramaUrl = URL.createObjectURL(blob)

    console.log("✅ Panorama projection created from mathematical data")
    return panoramaUrl
  } catch (error) {
    console.error("❌ Mathematical panorama creation failed:", error)
    throw error
  }
}

export function generateUltraSimplePrompt(basePrompt: string): string {
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    console.log(`📏 GODLEVEL prompt detected: ${basePrompt.length} characters`)
    const cleanPrompt = basePrompt.length > 4000 ? basePrompt.substring(0, 4000) + "..." : basePrompt
    return cleanPromptForImageGeneration(cleanPrompt)
  }

  const words = basePrompt.split(/[,\s]+/).filter((word) => word.length > 3)
  const keyWords = words.slice(0, 20)
  const ultraSimple = keyWords.join(" ")

  console.log(`📏 Ultra-simplified prompt: ${ultraSimple.length} characters`)
  return cleanPromptForImageGeneration(ultraSimple + ", highly detailed, 8K")
}

export async function generateSingleImageOnly(prompt: string): Promise<{
  mainImage: string
  domeImage: string
  panoramaImage: string
  method: string
  errors: string[]
}> {
  console.log("🚀 Single image generation with mathematical transformations")

  try {
    const isGodLevel = prompt.includes("GODLEVEL PROMPT:")
    const timeout = isGodLevel ? 25000 : 12000

    console.log(`⏱️ Using ${timeout / 1000}s timeout for ${isGodLevel ? "GODLEVEL" : "simple"} prompt`)

    const processedPrompt = isGodLevel ? cleanPromptForImageGeneration(prompt) : generateUltraSimplePrompt(prompt)
    const mainImage = await callOpenAI(processedPrompt, timeout)

    // Apply mathematical transformations to create dome and panorama versions
    console.log("🔄 Applying mathematical transformations...")
    const [domeImage, panoramaImage] = await Promise.all([
      createDomeFromMathematicalData(mainImage),
      createPanoramaFromMathematicalData(mainImage),
    ])

    return {
      mainImage,
      domeImage,
      panoramaImage,
      method: isGodLevel ? "single_godlevel_mathematical" : "single_mathematical",
      errors: [],
    }
  } catch (error: any) {
    console.error("❌ Single image generation with mathematical transforms failed:", error.message)
    throw new Error(`Single image generation failed: ${error.message}`)
  }
}

export function generateDomePrompt(basePrompt: string): string {
  // For dome, we want the same visual content but optimized for overhead viewing
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    const coreContent = basePrompt.replace("GODLEVEL PROMPT: ", "")
    return cleanPromptForImageGeneration(
      `OVERHEAD ZENITH VIEW: ${coreContent.substring(0, 3500)}, viewed from directly above looking down, top-down perspective, overhead angle, zenith viewpoint, suitable for dome ceiling projection, immersive overhead experience`,
    )
  }

  const simple = generateUltraSimplePrompt(basePrompt)
  return cleanPromptForImageGeneration(
    `OVERHEAD VIEW: ${simple}, viewed from above, top-down perspective, zenith angle`,
  )
}

export function generatePanoramaPrompt(basePrompt: string): string {
  // For panorama, we want wide horizontal coverage
  if (basePrompt.includes("GODLEVEL PROMPT:")) {
    const coreContent = basePrompt.replace("GODLEVEL PROMPT: ", "")
    return cleanPromptForImageGeneration(
      `WIDE PANORAMIC VIEW: ${coreContent.substring(0, 3500)}, ultra-wide horizontal perspective, 360-degree environmental view, panoramic landscape, wide-angle vista, immersive surround environment`,
    )
  }

  const simple = generateUltraSimplePrompt(basePrompt)
  return cleanPromptForImageGeneration(
    `PANORAMIC VIEW: ${simple}, ultra-wide horizontal perspective, 360-degree view, panoramic landscape`,
  )
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
  console.log("⚡ Attempting generation with mathematical transformations...")

  const isGodLevel = mainPrompt.includes("GODLEVEL PROMPT:")
  const isGenesisElement = mainPrompt.includes("Genesis")

  const mainTimeout = isGodLevel ? (isGenesisElement ? 25000 : 20000) : 12000

  console.log(`⏱️ Using timeout: Main=${mainTimeout / 1000}s`)

  try {
    // Generate main image first
    const mainImage = await callOpenAI(mainPrompt, mainTimeout)
    console.log("✅ Main image generated, applying mathematical transformations...")

    // Apply mathematical transformations to create dome and panorama versions
    const [domeImage, panoramaImage] = await Promise.all([
      createDomeFromMathematicalData(mainImage),
      createPanoramaFromMathematicalData(mainImage),
    ])

    return {
      mainImage,
      domeImage,
      panoramaImage,
      errors: [],
    }
  } catch (error: any) {
    console.error("❌ Mathematical transformation generation failed:", error.message)

    // Fallback: try generating separate images with different prompts
    console.log("🔄 Falling back to separate image generation...")

    const results = await Promise.allSettled([
      callOpenAI(mainPrompt, mainTimeout),
      callOpenAI(domePrompt, mainTimeout),
      callOpenAI(panoramaPrompt, mainTimeout),
    ])

    const response = {
      mainImage: undefined as string | undefined,
      domeImage: undefined as string | undefined,
      panoramaImage: undefined as string | undefined,
      errors: [] as string[],
    }

    if (results[0].status === "fulfilled") {
      response.mainImage = results[0].value
      console.log("✅ Main image generated")
    } else {
      response.errors.push(`Main: ${results[0].reason.message}`)
      console.error("❌ Main image failed:", results[0].reason.message)
    }

    if (results[1].status === "fulfilled") {
      response.domeImage = results[1].value
      console.log("✅ Dome image generated")
    } else {
      response.errors.push(`Dome: ${results[1].reason.message}`)
      console.error("❌ Dome image failed:", results[1].reason.message)
    }

    if (results[2].status === "fulfilled") {
      response.panoramaImage = results[2].value
      console.log("✅ Panorama image generated")
    } else {
      response.errors.push(`Panorama: ${results[2].reason.message}`)
      console.error("❌ Panorama image failed:", results[2].reason.message)
    }

    return response
  }
}
