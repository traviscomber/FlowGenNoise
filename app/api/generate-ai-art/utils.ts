export interface GenerationParams {
  dataset: string
  scenario?: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  customPrompt?: string
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
  panoramic360?: boolean
  panoramaResolution?: string
  panoramaFormat?: string
  stereographicPerspective?: string
}

export interface GenerationResult {
  imageUrl: string
  prompt: string
  metadata?: any
}

export async function generateWithOpenAI(prompt: string, type = "standard"): Promise<GenerationResult> {
  try {
    console.log("🎨 Starting OpenAI DALL-E 3 generation")
    console.log("🎯 Generation type:", type)
    console.log("📝 Prompt length:", prompt.length)

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OpenAI API key not configured")
    }

    // Determine optimal size based on type
    let size = "1024x1024" // Default square
    if (type === "360") {
      size = "1792x1024" // Wide format for panoramas
    } else if (type === "dome") {
      size = "1024x1024" // Square for dome projection
    }

    console.log("📐 Using size:", size)

    // Enhanced prompt for god-level quality
    const godLevelPrompt = `PROFESSIONAL MASTERPIECE: ${prompt}

TECHNICAL SPECIFICATIONS:
- Ultra-high definition rendering
- Professional studio lighting
- Cinematic composition
- HDR color grading
- Museum-quality detail
- Award-winning digital art
- Photorealistic excellence

QUALITY REQUIREMENTS:
- Flawless execution
- Perfect color balance
- Stunning visual impact
- Gallery-worthy presentation
- Professional artistic merit
- Technical perfection
- Creative excellence

${type === "360" ? "SEAMLESS 360° PANORAMA: Perfect edge continuity, horizontal wraparound, no visible seams, optimized for VR viewing, equirectangular projection" : ""}
${type === "dome" ? "DOME PROJECTION OPTIMIZED: Fisheye distortion correction, optimal for planetarium display, immersive viewing experience" : ""}

FINAL OUTPUT: Breathtaking professional artwork that exceeds all expectations`

    console.log("🚀 Sending request to OpenAI DALL-E 3")

    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: godLevelPrompt,
        n: 1,
        size: size,
        quality: "hd",
        style: "vivid",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Unknown error" }))
      console.error("❌ OpenAI API error:", errorData)
      throw new Error(errorData.error?.message || `OpenAI API error: ${response.status}`)
    }

    const data = await response.json()
    console.log("✅ OpenAI generation successful")

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("No image URL in OpenAI response")
    }

    const imageUrl = data.data[0].url
    console.log("🖼️ Generated image URL:", imageUrl.substring(0, 50) + "...")

    return {
      imageUrl: imageUrl,
      prompt: godLevelPrompt,
      metadata: {
        model: "dall-e-3",
        size: size,
        quality: "hd",
        style: "vivid",
        type: type,
        provider: "OpenAI",
        timestamp: new Date().toISOString(),
      },
    }
  } catch (error: any) {
    console.error("❌ OpenAI generation failed:", error)
    throw new Error(`OpenAI generation failed: ${error.message}`)
  }
}

// Safe image compression utility for browser environments
export function compressImage(file: File, quality = 0.8): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Check if we're in a browser environment
      if (typeof window === "undefined" || typeof Image === "undefined") {
        console.warn("Image compression not available in server environment")
        resolve(file)
        return
      }

      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")
      const img = new Image()

      img.onload = () => {
        try {
          canvas.width = img.width
          canvas.height = img.height

          if (ctx) {
            ctx.drawImage(img, 0, 0)
            canvas.toBlob(
              (blob) => {
                if (blob) {
                  resolve(blob)
                } else {
                  reject(new Error("Failed to compress image"))
                }
              },
              "image/jpeg",
              quality,
            )
          } else {
            reject(new Error("Could not get canvas context"))
          }
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for compression"))
      }

      // Set crossOrigin to handle CORS
      img.crossOrigin = "anonymous"
      img.src = URL.createObjectURL(file)
    } catch (error) {
      console.error("Image compression error:", error)
      // Fallback: return original file
      resolve(file)
    }
  })
}

// Validate file type
export function validateImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"]
  return allowedTypes.includes(file.type)
}

// Get file size in MB
export function getFileSizeMB(file: File): number {
  return file.size / (1024 * 1024)
}
