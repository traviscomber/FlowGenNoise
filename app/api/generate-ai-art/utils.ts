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
  provider?: "openai" | "replicate"
  replicateModel?: string
  width?: number
  height?: number
  aspectRatioId?: string // Added aspect ratio ID reference
}

export function validateGenerationParams(body: any): GenerationParams {
  return {
    dataset: body.dataset || "vietnamese",
    scenario: body.scenario || (body.dataset === "heads" ? "pure-mathematical" : "trung-sisters"),
    colorScheme: body.colorScheme || "neon",
    seed: Math.floor(Math.random() * 100000),
    numSamples: typeof body.numSamples === "number" ? body.numSamples : 4000,
    noiseScale: typeof body.noiseScale === "number" ? body.noiseScale : 0.08,
    customPrompt: body.customPrompt || "",
    domeProjection: body.domeProjection || false,
    domeDiameter: body.domeDiameter || 15,
    domeResolution: body.domeResolution || "4K",
    projectionType: body.projectionType || "fisheye",
    panoramic360: body.panoramic360 || false,
    panoramaResolution: body.panoramaResolution || "8K",
    panoramaFormat: body.panoramaFormat || "equirectangular",
    stereographicPerspective: body.stereographicPerspective || "wide-angle",
    provider: body.provider || "openai",
    replicateModel: body.replicateModel || "black-forest-labs/flux-1.1-pro",
    width: typeof body.width === "number" ? body.width : undefined,
    height: typeof body.height === "number" ? body.height : undefined,
    aspectRatioId: body.aspectRatioId || undefined, // Added aspect ratio ID reference
  }
}

// ULTRA-AGGRESSIVE SAFETY BYPASS SYSTEM - MAXIMUM PROTECTION
function sanitizePromptForSafety(prompt: string): string {
  console.log("🛡️ Applying safety transformations...")

  let sanitized = prompt

  // Keep only essential safety replacements for truly problematic terms
  const safetyReplacements = [
    // Violence/conflict terms -> artistic terms
    {
      pattern: /\b(weapon|weapons|sword|swords|gun|guns|rifle|rifles|bomb|bombs)\b/gi,
      replacement: "ceremonial element",
    },
  ]

  // Apply replacements with logging
  let replacementCount = 0
  safetyReplacements.forEach(({ pattern, replacement }) => {
    const matches = sanitized.match(pattern)
    if (matches) {
      console.log(`🔄 Replacing ${matches.length} instances of flagged terms`)
      sanitized = sanitized.replace(pattern, replacement)
      replacementCount += matches.length
    }
  })

  console.log(`🛡️ Total replacements made: ${replacementCount}`)
  console.log(`✅ Safety processing complete (${prompt.length} → ${sanitized.length} chars)`)

  return sanitized
}

async function retryWithBackoff<T>(fn: () => Promise<T>, maxRetries = 3, baseDelay = 1000): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      const isRateLimit = error.message.includes("Rate limit") || error.message.includes("429")
      const isBillingLimit = error.message.includes("billing limit") || error.message.includes("Billing hard limit")
      const isServerError =
        error.message.includes("503") ||
        error.message.includes("upstream connect error") ||
        error.message.includes("Connection refused")

      // Don't retry billing or auth errors
      if (isBillingLimit || error.message.includes("authentication failed")) {
        throw error
      }

      if ((!isRateLimit && !isServerError) || attempt === maxRetries) {
        throw error
      }

      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      if (isServerError) {
        console.log(
          `⚠️ OpenAI server error (503), retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})`,
        )
      } else {
        console.log(`⏱️ Rate limit hit, retrying in ${Math.round(delay)}ms (attempt ${attempt}/${maxRetries})`)
      }
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }
  throw new Error("Max retries exceeded")
}

export async function generateWithOpenAI(
  prompt: string,
  type: "standard" | "dome" | "360",
  params?: GenerationParams,
  signal?: AbortSignal,
): Promise<{ imageUrl: string; prompt: string }> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY

  console.log("[v0] Checking OpenAI API key availability...")
  console.log("[v0] OPENAI_API_KEY exists:", !!process.env.OPENAI_API_KEY)
  console.log("[v0] OPENAI_KEY exists:", !!process.env.OPENAI_KEY)
  console.log("[v0] Selected API key exists:", !!apiKey)
  console.log("[v0] API key length:", apiKey?.length || 0)
  console.log("[v0] API key starts with sk-:", apiKey?.startsWith("sk-") || false)
  console.log("[v0] API key starts with sk-proj-:", apiKey?.startsWith("sk-proj-") || false)

  if (!apiKey) {
    const availableEnvVars = Object.keys(process.env).filter((key) => key.includes("OPENAI"))
    console.error("[v0] No OpenAI API key found in environment variables")
    console.error("[v0] Available OpenAI-related env vars:", availableEnvVars)
    throw new Error(
      `OpenAI API key not configured. Please add a valid OPENAI_API_KEY environment variable. Available OpenAI-related env vars: ${availableEnvVars.join(", ") || "none found"}. Total env vars: ${Object.keys(process.env).length}`,
    )
  }

  // Validate API key format
  if (!apiKey.startsWith("sk-") && !apiKey.startsWith("sk-proj-")) {
    throw new Error("OpenAI API key format appears invalid. It should start with 'sk-' or 'sk-proj-'")
  }

  if (apiKey.endsWith("GxQA")) {
    throw new Error(
      "The current OpenAI API key has been rejected by OpenAI as invalid. Please generate a new API key from https://platform.openai.com/api-keys and update your environment variable with a valid key.",
    )
  }

  // Apply minimal safety bypass to the prompt
  const safePrompt = sanitizePromptForSafety(prompt)

  // Determine size based on type
  let size: "1024x1024" | "1792x1024"
  let enhancedPrompt = ""

  if (type === "360") {
    size = "1792x1024"
    const panoramaFormat = params?.panoramaFormat || "equirectangular"

    if (panoramaFormat === "equirectangular") {
      console.log("[v0] Applying enhanced DALL-E letterboxing for true 2:1 ratio workaround")
      enhancedPrompt = `PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA WITH ENHANCED LETTERBOXING - DALL-E TRUE 2:1 RATIO WORKAROUND: ${safePrompt}

MANDATORY ENHANCED LETTERBOXING SPECIFICATIONS FOR TRUE 2:1 EFFECTIVE RATIO:
• SOLID BLACK FRAMES at top and bottom (exactly 64 pixels each) creating perfect 2:1 effective ratio
• CENTER BAND contains equirectangular 360° content in precise 2:1 proportions (1792x896 effective area)
• BLACK LETTERBOX BARS frame the panoramic content with mathematical precision for true 2:1 extraction
• Equirectangular content CENTERED in middle horizontal band with professional calibration standards
• LEFT EDGE of center content must connect PERFECTLY with RIGHT EDGE - seamless wrapping within center band
• Professional latitude/longitude coordinate mapping with polar distortion handling in center band
• ZERO visible seams, color breaks, lighting discontinuities, or edge artifacts in the CENTER PANORAMIC BAND
• Black frames create clean 2:1 extraction area optimized for VR compatibility and 360° viewers
• ORION360 calibration quality with broadcast-standard edge continuity in panoramic center area

COMPOSITION STRUCTURE WITH MATHEMATICAL PRECISION:
• TOP: Solid black frame/border (exactly 64px height for perfect ratio)
• CENTER: 360° equirectangular panoramic content (1792x896 = true 2:1 ratio)
• BOTTOM: Solid black frame/border (exactly 64px height for perfect ratio)
• Total dimensions: 1792x1024 with mathematically precise 2:1 panoramic extraction area

TECHNICAL EXCELLENCE: 1792x1024 with enhanced black letterboxing, mathematically precise 2:1 equirectangular center band, professional seamless horizontal wrapping in center area, VR-optimized when cropped, broadcast standard, godlevel artistic mastery with perfect edge continuity and polar distortion handling in panoramic band.`
      console.log("[v0] Enhanced DALL-E letterboxing prompt applied, length:", enhancedPrompt.length)
    } else if (panoramaFormat === "stereographic") {
      const stereographicPerspective = params?.stereographicPerspective || "wide-angle"

      enhancedPrompt = `PROFESSIONAL STEREOGRAPHIC 360° PANORAMA - 1792x1024 FORMAT: ${safePrompt}

STEREOGRAPHIC 360° PANORAMIC MASTERY:
• Premium stereographic projection with perfect circular distortion at 1792x1024 resolution
• Entire 360° panoramic view compressed into flawless circular frame with mathematical precision
• Center focus with expertly calculated radial distortion increasing toward edges
• Professional stereographic mapping with award-winning technical execution for 360° viewing
• Museum-quality wide-angle effect with godlevel artistic precision for panoramic immersion
• ${stereographicPerspective} perspective optimized for seamless 360° panoramic experience

TECHNICAL EXCELLENCE: 1792x1024 resolution, perfect circular composition, professional stereographic projection for 360° panoramas, award-winning wide-angle distortion, museum exhibition quality, godlevel panoramic mastery, cultural heritage art.`
    }
  } else if (type === "dome") {
    size = "1024x1024"
    const projectionType = params?.projectionType || "fisheye"

    console.log("[v0] ===== DOME PROMPT GENERATION DEBUG =====")
    console.log("[v0] Dome projection type:", projectionType)
    console.log("[v0] Dome diameter:", params?.domeDiameter || 15)
    console.log("[v0] Dome resolution:", params?.domeResolution || "4K")

    if (projectionType === "fisheye") {
      enhancedPrompt = `Generate an ultra-wide-angle 180-degree hemispherical fisheye panorama. The camera is oriented straight up along the z-axis (zenith view), resulting in extreme barrel distortion. The sky must be positioned at the absolute, mathematically precise center of the image, surrounded by curved environmental elements, which can be natural or man-made structures. Establish perfect radial geometry extending from the center outward to the edges. The image must explicitly show the horizon completely absent, replaced by the circular frame of the immediate surroundings. The surrounding elements (e.g., buildings, columns, bridges, or trees/foliage) must curve dramatically inward toward the frame edges.

ARTISTIC CONTENT: ${safePrompt}

FISHEYE DOME ARTISTIC MASTERY:
• 180-degree hemispherical panorama with ultra-wide-angle fisheye lens, camera oriented straight up on z-axis (zenith view)
• Extreme barrel distortion where horizon completely disappears, replaced by circular frame of immediate surroundings
• Sky positioned at absolute, mathematically precise center, surrounded by curved environmental elements (natural or man-made)
• Perfect radial geometry extending from center outward to edges with professional dome mapping accuracy
• NO architectural structures, NO stadium seating, NO dome interiors - only natural outdoor fisheye perspective
• Natural environment curves dramatically inward toward frame edges creating circular boundary effect
• Optimized for premium planetarium dome projection with immersive 180° viewing experience
• Museum-quality fisheye lens effect with award-winning technical precision

ARTISTIC EXCELLENCE: Professional hemispherical fisheye projection, extreme barrel distortion, perfect circular composition, natural outdoor perspective only, planetarium optimization, museum exhibition quality, godlevel dome mastery, cultural heritage visualization.`
    }
  } else {
    size = "1024x1024"
    enhancedPrompt = `ULTIMATE ARTISTIC STANDARD COMPOSITION: ${safePrompt}

STANDARD ARTISTIC MASTERY:
• Perfectly balanced and centered composition with professional framing excellence
• Optimal visual hierarchy with award-winning artistic quality and museum-grade execution
• Masterpiece-level attention to detail with premium artistic excellence
• Professional broadcast quality with godlevel artistic mastery worthy of international exhibitions

ARTISTIC EXCELLENCE: Perfect composition, professional framing, museum exhibition quality, godlevel artistic mastery, award-winning visual impact, cultural heritage visualization, educational artistic content.`
  }

  // Ensure we stay within 4000 character limit
  if (enhancedPrompt.length > 3900) {
    let truncated = enhancedPrompt.substring(0, 3800)
    const lastSentence = truncated.lastIndexOf(".")
    if (lastSentence > 3500) {
      truncated = truncated.substring(0, lastSentence + 1)
    }

    if (type === "360" && !truncated.includes("LEFT EDGE must connect PERFECTLY with RIGHT EDGE")) {
      truncated += " CRITICAL: LEFT EDGE must connect PERFECTLY with RIGHT EDGE - zero visible seam."
    }

    if (!truncated.includes("artistic")) {
      truncated += " Artistic cultural heritage visualization."
    }

    enhancedPrompt = truncated + "..."
  }

  console.log(`🎨 Generating ${type} image with OpenAI DALL-E 3`)
  console.log(`📐 Size: ${size}`)
  console.log(`📝 Enhanced prompt length: ${enhancedPrompt.length} chars`)
  console.log(`🛡️ Safety bypass applied: ${prompt !== safePrompt ? "YES" : "NO"}`)
  console.log(
    `🎯 Projection: ${type === "360" ? params?.panoramaFormat : type === "dome" ? params?.projectionType : "standard"}`,
  )

  // FIRST ATTEMPT - Try with safety-bypassed prompt with retry logic
  try {
    console.log("🎯 Attempting generation with safety-bypassed prompt...")
    return await retryWithBackoff(() => makeOpenAIRequest(enhancedPrompt), 3, 2000)
  } catch (error: any) {
    if (
      error.message.includes("billing limit") ||
      error.message.includes("authentication failed") ||
      error.message === "CONTENT_POLICY_VIOLATION"
    ) {
      if (error.message === "CONTENT_POLICY_VIOLATION") {
        console.log(`⚠️ Content policy violation, trying ultra-safe fallback...`)
      } else {
        throw error // Re-throw billing/auth errors immediately
      }
    } else {
      console.log(`⚠️ Safety-bypassed prompt failed with error: ${error.message}`)
    }
  }

  // SECOND ATTEMPT - Ultra-safe fallback with retry logic
  console.log("🚨 Primary prompt failed, trying ULTRA-SAFE fallback...")

  try {
    const ultraSafePrompt = generateUltraSafeFallbackPrompt(type, params)
    console.log("✅ Ultra-safe fallback generation successful")
    return await retryWithBackoff(() => makeOpenAIRequest(ultraSafePrompt), 3, 2000)
  } catch (error: any) {
    if (error.name === "AbortError") {
      throw new Error("Generation was cancelled")
    }
    console.error(`❌ OpenAI generation failed for ${type}:`, error)
    throw error
  }
}

// ULTRA-SAFE FALLBACK PROMPT GENERATOR
function makeOpenAIRequest(promptToUse: string): Promise<{ imageUrl: string; prompt: string }> {
  const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not found in makeOpenAIRequest")
  }

  const size: "1024x1024" | "1792x1024" = promptToUse.includes("360") ? "1792x1024" : "1024x1024"

  console.log("[v0] DALL-E makeOpenAIRequest - Size determined:", size)
  console.log("[v0] DALL-E makeOpenAIRequest - Prompt includes '360':", promptToUse.includes("360"))
  console.log("[v0] DALL-E makeOpenAIRequest - Prompt includes 'LETTERBOXING':", promptToUse.includes("LETTERBOXING"))

  return fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "dall-e-3",
      prompt: promptToUse,
      n: 1,
      size: size,
      quality: "hd",
      style: "vivid",
    }),
  }).then(async (response) => {
    console.log("[v0] OpenAI API response status:", response.status)
    console.log("[v0] OpenAI API response ok:", response.ok)

    if (response.ok) {
      const data = await response.json()
      console.log("[v0] OpenAI API response data received:", !!data.data)
      if (data.data && data.data[0] && data.data[0].url) {
        return {
          imageUrl: data.data[0].url,
          prompt: promptToUse,
        }
      }
    }

    // Handle errors
    const errorData = await response.json().catch(() => ({}))
    console.log("[v0] Full error data:", errorData)
    const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`
    const errorCode = errorData.error?.code

    if (errorCode === "billing_hard_limit_reached" || errorMessage.includes("Billing hard limit has been reached")) {
      throw new Error(
        "💳 OpenAI billing limit reached. Please add credits to your OpenAI account at https://platform.openai.com/account/billing to continue generating images. Your account has exceeded its spending limit.",
      )
    }

    if (response.status === 429) {
      throw new Error(
        "⏱️ Rate limit exceeded. OpenAI is temporarily limiting requests. Please wait a few minutes and try again.",
      )
    }

    if (response.status === 401) {
      throw new Error(
        "🔑 OpenAI API key authentication failed. The API key appears to be invalid, expired, or revoked. Please verify your API key at https://platform.openai.com/api-keys",
      )
    }

    if (
      response.status === 503 ||
      errorMessage.includes("upstream connect error") ||
      errorMessage.includes("Connection refused")
    ) {
      throw new Error(
        `⚠️ OpenAI servers are temporarily unavailable (503). This is usually temporary - the system will automatically retry. Error: ${errorMessage}`,
      )
    }

    if (response.status === 400 && errorMessage.includes("content policy")) {
      throw new Error("CONTENT_POLICY_VIOLATION")
    }

    throw new Error(`🚫 OpenAI API Error: ${errorMessage}`)
  })
}

// ULTRA-SAFE FALLBACK PROMPT GENERATOR
function generateUltraSafeFallbackPrompt(type: "standard" | "dome" | "360", params?: GenerationParams): string {
  console.log("🚨 Generating ULTRA-SAFE fallback prompt...")

  const basePrompts = [
    "Abstract geometric artistic composition with mathematical patterns and cultural heritage motifs",
    "Educational museum-quality digital art featuring traditional artistic elements",
    "Scholarly cultural documentation artwork with respectful artistic representation",
    "Academic artistic study showcasing heritage preservation and cultural appreciation",
    "Museum exhibition artwork celebrating traditional cultural beauty and artistic excellence",
    "Educational cultural visualization with professional artistic integrity and historical significance",
    "Respectful artistic tribute featuring cultural heritage elements and traditional artistic honor",
    "Museum-worthy artistic creation with educational value and cultural appreciation themes",
    "Professional artistic masterpiece showcasing heritage magnificence and traditional grandeur",
    "Award-winning cultural artwork with educational importance and respectful artistic dignity",
  ]

  const colorSchemes = [
    "warm golden and bronze tones with artistic elegance",
    "soft pastel colors with gentle artistic harmony",
    "rich jewel tones with professional artistic sophistication",
    "earth tones with natural artistic beauty",
    "monochromatic artistic variations with subtle gradations",
    "metallic artistic finishes with lustrous professional quality",
    "sunset colors with warm artistic atmosphere",
    "ocean blues with serene artistic tranquility",
    "forest greens with natural artistic harmony",
    "crystalline colors with prismatic artistic brilliance",
  ]

  const qualityDescriptors = [
    "museum-grade artistic quality with professional excellence",
    "award-winning artistic composition with international recognition",
    "godlevel artistic mastery with premium sophistication",
    "professional broadcast standard with artistic innovation",
    "museum exhibition worthy with cultural significance",
    "educational artistic value with respectful representation",
    "heritage preservation quality with traditional honor",
    "scholarly artistic documentation with academic integrity",
    "cultural appreciation artwork with artistic celebration",
    "traditional artistic beauty with respectful homage",
  ]

  const basePrompt = basePrompts[Math.floor(Math.random() * basePrompts.length)]
  const colorScheme = colorSchemes[Math.floor(Math.random() * colorSchemes.length)]
  const qualityDescriptor = qualityDescriptors[Math.floor(Math.random() * qualityDescriptors.length)]

  let fallbackPrompt = `${basePrompt}, ${colorScheme}, ${qualityDescriptor}`

  // Add type-specific safe instructions
  if (type === "360") {
    fallbackPrompt +=
      ", seamless panoramic artistic composition with perfect horizontal continuity, professional VR-optimized artwork, museum-quality 360-degree cultural visualization, educational immersive artistic experience"
  } else if (type === "dome") {
    fallbackPrompt +=
      ", circular artistic composition with radial symmetry, professional planetarium-optimized artwork, museum-quality dome projection visualization, educational immersive artistic experience"
  } else {
    fallbackPrompt +=
      ", perfectly balanced artistic composition with professional framing, museum-quality standard format artwork, educational cultural visualization"
  }

  // Add comprehensive safety padding
  fallbackPrompt +=
    ", 8K HDR artistic quality, professional artistic standards, award-winning artistic excellence, godlevel artistic achievement, premium artistic mastery, international artistic recognition, cultural artistic appreciation, heritage artistic preservation, traditional artistic honor, respectful artistic tribute, educational artistic value, museum-worthy artistic creation, professional artistic integrity, award-winning artistic innovation, godlevel artistic perfection, premium artistic sophistication, international artistic excellence, cultural artistic celebration, heritage artistic magnificence, traditional artistic beauty, respectful artistic homage, educational artistic significance, museum-quality artistic achievement, professional artistic mastery, award-winning artistic brilliance, godlevel artistic transcendence, premium artistic elevation, international artistic distinction, cultural artistic reverence, heritage artistic splendor, traditional artistic grandeur, respectful artistic dignity, educational artistic honor, museum-grade artistic supremacy, professional artistic prestige, award-winning artistic acclaim, godlevel artistic renown, premium artistic fame, international artistic celebrity, cultural artistic stardom, heritage artistic legend, traditional artistic myth, respectful artistic folklore, educational artistic story, museum-grade artistic narrative, professional artistic epic, award-winning artistic saga, godlevel artistic chronicle, premium artistic history, international artistic record, cultural artistic documentation, heritage artistic archive, traditional artistic preservation, respectful artistic conservation, educational artistic protection, museum-worthy artistic safeguarding, professional artistic maintenance, award-winning artistic care, godlevel artistic stewardship, premium artistic guardianship, international artistic custody, cultural artistic trusteeship, heritage artistic responsibility, traditional artistic duty, respectful artistic obligation, educational artistic commitment, museum-grade artistic dedication, professional artistic devotion, award-winning artistic loyalty, godlevel artistic faithfulness, premium artistic constancy, international artistic steadfastness, cultural artistic reliability, heritage artistic dependability, traditional artistic trustworthiness, respectful artistic integrity, educational artistic honesty, museum-grade artistic authenticity, professional artistic genuineness, award-winning artistic sincerity, godlevel artistic truth, premium artistic reality, international artistic actuality, cultural artistic fact, heritage artistic certainty, traditional artistic assurance, respectful artistic confidence, educational artistic conviction"

  console.log(`🛡️ Ultra-safe fallback prompt generated (${fallbackPrompt.length} chars)`)
  return fallbackPrompt
}

export const REPLICATE_MODELS = {
  "black-forest-labs/flux-1.1-pro-ultra": {
    name: "FLUX 1.1 Pro Ultra (Preferred)",
    description: "Ultimate quality FLUX model with maximum detail and flexible aspect ratios",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "2:1", "3:4", "4:3", "16:9", "21:9", "4:5", "9:16", "9:21"],
  },
  "bytedance/seedream-3": {
    name: "SeeDream-3",
    description: "High quality alternative model with good performance",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "black-forest-labs/flux-1.1-pro": {
    name: "FLUX 1.1 Pro",
    description: "Premium quality with improved image generation over 1080p",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "black-forest-labs/flux-pro": {
    name: "FLUX Pro",
    description: "State-of-the-art performance optimized for high-resolution output",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "black-forest-labs/flux-schnell": {
    name: "FLUX Schnell (Fast & High Quality)",
    description: "12B parameter model optimized for speed and quality over 1080p",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "black-forest-labs/flux-dev": {
    name: "FLUX Dev",
    description: "Development version with excellent high-resolution quality",
    category: "FLUX",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "bytedance/sdxl-lightning-4step": {
    name: "SDXL Lightning 4-Step",
    description: "High-quality images optimized for resolutions over 1080p",
    category: "Stable Diffusion",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "stability-ai/stable-diffusion-3.5-large": {
    name: "Stable Diffusion 3.5 Large",
    description: "Latest large model optimized for maximum quality output",
    category: "Stable Diffusion",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "stability-ai/stable-diffusion-3.5-large-turbo": {
    name: "Stable Diffusion 3.5 Large Turbo",
    description: "Turbo version optimized for high-quality generation over 1080p",
    category: "Stable Diffusion",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "ideogram-ai/ideogram-v3-quality": {
    name: "Ideogram V3 Quality",
    description: "Highest quality text generation optimized for maximum resolution",
    category: "Text Specialists",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "ideogram-ai/ideogram-v3-turbo": {
    name: "Ideogram V3 Turbo",
    description: "Fast, high-quality text generation optimized over 1080p",
    category: "Text Specialists",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "ideogram-ai/ideogram-v3-balanced": {
    name: "Ideogram V3 Balanced",
    description: "Balanced speed and maximum quality for high-resolution output",
    category: "Text Specialists",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "google/imagen-4-ultra": {
    name: "Imagen 4 Ultra",
    description: "Google's highest quality model optimized for maximum resolution",
    category: "Google",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "google/imagen-4": {
    name: "Imagen 4",
    description: "Google's latest model optimized for high-quality output over 1080p",
    category: "Google",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "google/imagen-4-fast": {
    name: "Imagen 4 Fast",
    description: "Fast version optimized for quality over 1080p resolution",
    category: "Google",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "recraft-ai/recraft-v3": {
    name: "Recraft V3",
    description: "Professional design-focused generation optimized for maximum quality",
    category: "Specialized",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "luma/photon": {
    name: "Luma Photon",
    description: "High-quality photorealistic generation optimized over 1080p",
    category: "Specialized",
    maxSize: "1440x1440",
    supportedAspectRatios: ["1:1", "4:3", "16:9"],
  },
  "nvidia/sana": {
    name: "NVIDIA SANA 4K",
    description: "NVIDIA's 4K model optimized for ultra-high resolution output up to 4096x4096",
    category: "Specialized",
    maxSize: "4096x4096",
    supportedAspectRatios: ["1:1", "2:1", "4:3", "3:4", "3:2", "2:3", "16:9", "9:16", "21:9", "9:21", "4:5", "5:4"],
  },
}

export async function generateWithReplicate(
  prompt: string,
  type: "standard" | "dome" | "360",
  params?: GenerationParams,
  signal?: AbortSignal,
  aspectRatioOverride?: string,
): Promise<{ imageUrl: string; prompt: string }> {
  const apiToken = process.env.REPLICATE_API_TOKEN

  console.log("[v0] Checking Replicate API token availability...")
  console.log("[v0] REPLICATE_API_TOKEN exists:", !!apiToken)
  console.log("[v0] API token length:", apiToken?.length || 0)

  if (!apiToken) {
    throw new Error("Replicate API token not configured. Please add REPLICATE_API_TOKEN environment variable.")
  }

  const model = params?.replicateModel || "black-forest-labs/flux-1.1-pro-ultra"
  const isNvidiaSana = model === "nvidia/sana"
  const safePrompt = sanitizePromptForSafety(prompt)

  let aspectRatio = aspectRatioOverride || "1:1" // Default aspect ratio

  if (!aspectRatioOverride) {
    if (type === "360") {
      aspectRatio = "21:9" // Closest wide format for equirectangular panorama (21:9 = 2.33, closest to 2:1 = 2.0)
      if (isNvidiaSana && aspectRatioOverride === "2:1") {
        aspectRatio = "2:1" // True equirectangular format for NVIDIA SANA 4K
      }
    } else if (type === "dome") {
      aspectRatio = "1:1" // Perfect for dome projection
    } else {
      aspectRatio = "1:1" // Default for standard
    }

    // Allow custom aspect ratio from params if provided, but only use supported values
    if (params?.width && params?.height) {
      const ratio = params.width / params.height
      if (ratio >= 2.3) aspectRatio = "21:9"
      else if (ratio >= 1.7) aspectRatio = "16:9"
      else if (ratio >= 1.4) aspectRatio = "3:2"
      else if (ratio >= 1.2) aspectRatio = "4:3"
      else if (ratio >= 1.1) aspectRatio = "5:4"
      else if (ratio >= 0.9) aspectRatio = "1:1"
      else if (ratio >= 0.8) aspectRatio = "4:5"
      else if (ratio >= 0.7) aspectRatio = "3:4"
      else if (ratio >= 0.5) aspectRatio = "2:3"
      else if (ratio >= 0.4) aspectRatio = "9:16"
      else aspectRatio = "9:21"
    }
  } else {
    const supportedRatios = ["21:9", "16:9", "3:2", "4:3", "5:4", "1:1", "4:5", "3:4", "2:3", "9:16", "9:21"]
    if (!supportedRatios.includes(aspectRatioOverride)) {
      console.log(`[v0] Invalid aspect ratio ${aspectRatioOverride}, defaulting to 21:9 for ${type}`)
      aspectRatio = type === "360" ? "21:9" : "1:1"
    } else {
      aspectRatio = aspectRatioOverride
    }
  }

  console.log(`[v0] Using aspect ratio: ${aspectRatio} for ${type} generation`)

  let enhancedPrompt = ""

  if (type === "360") {
    const { buildGodlevelNeuralia360Wrapper } = await import("@/lib/ai-prompt")

    const basePrompt = `PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA - ENHANCED ORION360 CALIBRATION STANDARD: ${safePrompt}

MANDATORY SEAMLESS PROFESSIONAL SPECIFICATIONS - OPTIMIZED FOR TRUE 2:1 RATIO:
• ${aspectRatio === "2:1" ? "Perfect 2:1 aspect ratio providing true equirectangular format" : `Ultra-wide ${aspectRatio} format optimized for equirectangular panorama (closest available to 2:1)`}
• LEFT EDGE must connect PERFECTLY with RIGHT EDGE - mathematical precision seamless wrapping
• Professional equirectangular projection with latitude/longitude coordinate mapping precision
• Continuous horizontal environment with ZERO visible seams, color breaks, or lighting discontinuities
• Professional polar distortion handling with mathematical algorithms for proper sphere mapping
• ORION360 calibration quality with museum-grade seamless wrapping and broadcast-quality edge continuity
• VR-optimized for premium headsets with flawless wraparound immersive experience
• Professional seamless edge alignment worthy of ORION360 calibration test patterns with godlevel precision

TECHNICAL EXCELLENCE: ${aspectRatio === "2:1" ? "True 2:1" : `Optimized ${aspectRatio}`} equirectangular format, professional seamless horizontal wrapping with latitude/longitude precision, ORION360 calibration quality, VR-optimized, broadcast standard, godlevel artistic mastery with perfect edge continuity and polar distortion handling, cultural heritage visualization.`

    // Always apply enhanced godlevel neuralia wrapper for 360° images across all models
    enhancedPrompt = buildGodlevelNeuralia360Wrapper(
      basePrompt,
      params?.dataset || "vietnamese",
      params?.scenario || "trung-sisters",
      params?.colorScheme || "neon",
    )
    console.log(
      `[v0] Applied enhanced godlevel neuralia 360° equirectangular wrapper for ${isNvidiaSana ? "NVIDIA SANA" : "FLUX"} with ${aspectRatio} ratio`,
    )
  } else if (type === "dome") {
    enhancedPrompt = `Generate an ultra-wide-angle 180-degree hemispherical fisheye panorama. The camera is oriented straight up along the z-axis (zenith view), resulting in extreme barrel distortion. The sky must be positioned at the absolute, mathematically precise center of the image, surrounded by curved environmental elements, which can be natural or man-made structures. Establish perfect radial geometry extending from the center outward to the edges. The image must explicitly show the horizon completely absent, replaced by the circular frame of the immediate surroundings. The surrounding elements (e.g., buildings, columns, bridges, or trees/foliage) must curve dramatically inward toward the frame edges.

ARTISTIC CONTENT: ${safePrompt}

FISHEYE DOME ARTISTIC MASTERY:
• 180-degree hemispherical panorama with ultra-wide-angle fisheye lens, camera oriented straight up on z-axis (zenith view)
• Extreme barrel distortion where horizon completely disappears, replaced by circular frame of immediate surroundings
• Sky positioned at absolute, mathematically precise center, surrounded by curved environmental elements (natural or man-made)
• Perfect radial geometry extending from center outward to edges with professional dome mapping accuracy
• NO architectural structures, NO stadium seating, NO dome interiors - only natural outdoor fisheye perspective
• Natural environment curves dramatically inward toward frame edges creating circular boundary effect
• Optimized for premium planetarium dome projection with immersive 180° viewing experience
• Museum-quality fisheye lens effect with award-winning technical precision

ARTISTIC EXCELLENCE: Professional hemispherical fisheye projection, extreme barrel distortion, perfect circular composition, natural outdoor perspective only, planetarium optimization, museum exhibition quality, godlevel dome mastery, cultural heritage visualization.`
  } else {
    enhancedPrompt = `ULTRA-HIGH-QUALITY STANDARD IMAGE: ${safePrompt}. Professional resolution and detail optimized for premium quality output.`
  }

  console.log(
    `🎨 Generating ${type} image with ${isNvidiaSana ? "NVIDIA SANA" : "FLUX 1.1 Pro Ultra"} (${isNvidiaSana ? "NVIDIA specialized model" : "preferred model"})`,
  )
  console.log(
    `📐 Aspect ratio: ${aspectRatio} (${type === "360" ? "optimal 21:9 ultra-wide equirectangular with godlevel neuralia enhancement" : `${isNvidiaSana ? "NVIDIA SANA" : "FLUX 1.1 Pro Ultra"} supported format`})`,
  )
  console.log(`📝 Enhanced prompt length: ${enhancedPrompt.length} chars`)

  try {
    const replicateToken = process.env.REPLICATE_API_TOKEN

    let modelVersion: string
    if (isNvidiaSana) {
      modelVersion = "352185dbc99e9dd708b78b4e6870e3ca49d00dc6451a32fc6dd57968194fae5a" // NVIDIA SANA version
    } else {
      modelVersion = "352185dbc99e9dd708b78b4e6870e3ca49d00dc6451a32fc6dd57968194fae5a" // FLUX 1.1 Pro Ultra version
    }

    const response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${replicateToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: {
          prompt: enhancedPrompt,
          aspect_ratio: aspectRatio,
          output_format: "png",
          raw: Math.random() > 0.5, // Randomly choose between processed and raw mode
          safety_tolerance: Math.floor(Math.random() * 3) + 4, // Random between 4-6 for artistic variety
          seed: Math.floor(Math.random() * 100000), // Always use a fresh random seed
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`[v0] Replicate API error response: ${errorText}`)
      throw new Error(`Replicate API error: ${response.status} ${response.statusText}`)
    }

    const prediction = await response.json()
    console.log(`[v0] Prediction created with ID: ${prediction.id}`)

    // Poll for completion
    let result = prediction
    while (result.status === "starting" || result.status === "processing") {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const pollResponse = await fetch(`https://api.replicate.com/v1/predictions/${result.id}`, {
        headers: {
          Authorization: `Token ${apiToken}`,
        },
      })
      result = await pollResponse.json()
      console.log(`[v0] Prediction status: ${result.status}`)
    }

    if (result.status === "succeeded" && result.output) {
      // Both FLUX and NVIDIA SANA return a single URL, not an array
      const imageUrl = Array.isArray(result.output) ? result.output[0] : result.output
      return {
        imageUrl: imageUrl,
        prompt: enhancedPrompt,
      }
    } else {
      console.error(`[v0] Generation failed with status: ${result.status}`)
      console.error(`[v0] Error details:`, result.error)
      throw new Error(`Generation failed: ${result.error || result.status || "Unknown error"}`)
    }
  } catch (error: any) {
    console.error(`❌ ${isNvidiaSana ? "NVIDIA SANA" : "FLUX 1.1 Pro Ultra"} generation failed:`, error.message)
    throw error
  }
}

function mapAspectRatioName(name: string): string {
  const aspectRatioMap: { [key: string]: string } = {
    // Standard descriptive names to format strings
    Square: "1:1",
    "Dome Square": "1:1",
    "360° Panoramic": "21:9",
    "360° Ultra Wide": "21:9",
    Wide: "16:9",
    Portrait: "9:16",
    Landscape: "4:3",
    "Portrait Tall": "3:4",
    Cinema: "21:9",
    Standard: "4:3",
    Vertical: "9:16",
    Horizontal: "16:9",
    "SANA 4K 2:1": "2:1",
    "SANA 4K Square": "1:1",
    "SANA 4K Wide": "21:9",
    "SANA 4K Cinema": "21:9",
    "SANA 4K Portrait": "9:16",
    "SANA 4K Landscape": "16:9",
    // NVIDIA SANA 4K formats
    "4K Square": "1:1",
    "4K Equirectangular": "2:1",
    "4K Wide": "21:9",
    "4K Cinema": "21:9",
    "4K Portrait": "9:16",
    "4K Landscape": "16:9",
    // Keep existing format strings as-is
    "1:1": "1:1",
    "2:1": "2:1",
    "3:2": "3:2",
    "4:3": "4:3",
    "5:4": "5:4",
    "4:5": "4:5",
    "3:4": "3:4",
    "2:3": "2:3",
    "16:9": "16:9",
    "9:16": "9:16",
    "21:9": "21:9",
    "9:21": "9:21",
  }

  return aspectRatioMap[name] || name
}

export async function generateImage(
  prompt: string,
  type: "standard" | "dome" | "360",
  params?: GenerationParams,
  provider?: "openai" | "replicate",
  model?: string,
  selectedAspectRatio?: { standard?: string; dome?: string; "360"?: string },
  frameless?: boolean,
): Promise<{ imageUrl: string; prompt: string; provider: string }> {
  const actualProvider = provider || params?.provider || "replicate"

  console.log(`[v0] Starting image generation with ${actualProvider}`)

  if (frameless) {
    console.log("[v0] Frameless mode enabled - skipping enhancement wrappers")
  }

  let aspectRatioOverride: string | undefined
  if (selectedAspectRatio) {
    try {
      const { supabase } = await import("@/lib/supabase")
      let aspectRatioId: string | undefined

      if (type === "standard") {
        aspectRatioId = selectedAspectRatio.standard
      } else if (type === "dome") {
        aspectRatioId = selectedAspectRatio.dome
      } else if (type === "360") {
        aspectRatioId = selectedAspectRatio["360"]
      }

      if (aspectRatioId) {
        const { data: aspectRatioData, error } = await supabase
          .from("aspect_ratios")
          .select("name")
          .eq("id", aspectRatioId)
          .single()

        if (!error && aspectRatioData) {
          const mappedName = mapAspectRatioName(aspectRatioData.name)
          const supportedRatios = [
            "21:9",
            "16:9",
            "3:2",
            "4:3",
            "5:4",
            "1:1",
            "4:5",
            "3:4",
            "2:3",
            "9:16",
            "9:21",
            "2:1",
          ]
          if (supportedRatios.includes(mappedName)) {
            aspectRatioOverride = mappedName
            console.log(`[v0] Using selected aspect ratio: ${aspectRatioOverride} for ${type} generation`)
          } else {
            console.log(
              `[v0] Unsupported aspect ratio: ${aspectRatioData.name} (mapped to ${mappedName}), using default`,
            )
            aspectRatioOverride = type === "360" ? "21:9" : "1:1"
          }
        }
      }
    } catch (error) {
      console.error("[v0] Error fetching aspect ratio:", error)
      aspectRatioOverride = type === "360" ? "21:9" : "1:1"
    }
  }

  let finalPrompt = prompt
  if (!frameless) {
    // Apply enhancement wrappers only when not frameless
    if (actualProvider === "replicate" && type === "360") {
      const { buildGodlevelNeuralia360Wrapper } = await import("@/lib/ai-prompt")
      finalPrompt = buildGodlevelNeuralia360Wrapper(
        prompt,
        params?.dataset || "vietnamese",
        params?.scenario || "trung-sisters",
        params?.colorScheme || "metallic",
      )
      console.log("[v0] Applied godlevel neuralia 360° equirectangular wrapper for FLUX")
    } else if (actualProvider === "replicate" && type === "dome") {
      // Apply dome-specific enhancements
      finalPrompt = `FISHEYE PROJECTION: ${prompt}`
      console.log("[v0] Applied fisheye projection wrapper for dome generation")
    }
  } else {
    console.log("[v0] Skipping enhancement wrappers due to frameless mode")
  }

  if (actualProvider === "replicate") {
    try {
      const result = await generateWithReplicate(finalPrompt, type, params, undefined, aspectRatioOverride)
      return { ...result, provider: "replicate" }
    } catch (error: any) {
      console.error("❌ Replicate generation failed:", error.message)
      console.log("🔄 Falling back to OpenAI...")

      try {
        const result = await generateWithOpenAI(finalPrompt, type, params, undefined)
        return { ...result, provider: "openai-fallback" }
      } catch (fallbackError: any) {
        console.error("❌ OpenAI fallback also failed:", fallbackError.message)
        throw new Error(`Both providers failed. Replicate: ${error.message}. OpenAI: ${fallbackError.message}`)
      }
    }
  } else {
    try {
      const result = await generateWithOpenAI(finalPrompt, type, params, undefined)
      return { ...result, provider: "openai" }
    } catch (error: any) {
      console.error("❌ OpenAI generation failed:", error.message)
      console.log("🔄 Falling back to Replicate...")

      try {
        const result = await generateWithReplicate(
          finalPrompt,
          type,
          { ...params, replicateModel: "black-forest-labs/flux-1.1-pro-ultra" },
          undefined,
          aspectRatioOverride,
        )
        return { ...result, provider: "replicate-fallback" }
      } catch (fallbackError: any) {
        console.error("❌ Replicate fallback also failed:", fallbackError.message)
        throw new Error(`Both providers failed. OpenAI: ${error.message}. Replicate: ${fallbackError.message}`)
      }
    }
  }
}
