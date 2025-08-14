import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    console.log("🎨 ChatGPT Prompt Enhancement request received")

    const body = await request.json()
    console.log("📝 Enhancement request body:", JSON.stringify(body, null, 2))

    // Extract parameters
    const {
      dataset = "vietnamese",
      scenario = "trung-sisters",
      colorScheme = "metallic",
      seed = 1234,
      numSamples = 4000,
      noiseScale = 0.08,
      customPrompt = "",
      panoramic360 = false,
      panoramaFormat = "equirectangular",
      projectionType = "fisheye",
      variationType = "moderate",
      generationType = "standard",
    } = body

    // Build the base prompt
    const basePrompt = buildPrompt({
      dataset,
      scenario,
      colorScheme,
      seed,
      numSamples,
      noiseScale,
      customPrompt,
      panoramic360,
      panoramaFormat,
      projectionType,
    })

    console.log("📝 Base prompt generated:", basePrompt.substring(0, 200) + "...")

    // Enhance with ChatGPT
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      throw new Error("OpenAI API key not configured")
    }

    // Create enhancement instructions based on variation type and generation type
    let enhancementInstructions = ""

    if (generationType === "360" && panoramaFormat === "equirectangular") {
      enhancementInstructions = `You are a professional AI art prompt engineer specializing in 360° VR panoramic art. Your task is to enhance this prompt for GODLEVEL PROFESSIONAL 360° EQUIRECTANGULAR PANORAMA generation with PERFECT SEAMLESS WRAPPING.

CRITICAL SEAMLESS WRAPPING REQUIREMENTS:
- The LEFT EDGE must connect PERFECTLY with the RIGHT EDGE with mathematical precision
- ZERO visible seams, discontinuities, breaks, or artifacts at horizontal edges
- Perfect cylindrical projection mapping where left boundary = right boundary exactly
- Seamless wraparound that creates one continuous immersive 360° environment
- Professional VR-quality with museum-grade seamless edge alignment

Enhancement Level: ${variationType}
- slight: Add 20-30% more detail while maintaining core concept
- moderate: Add 40-60% more detail with richer descriptions and professional terminology
- dramatic: Transform into a masterpiece-level prompt with 80-100% more artistic detail

ENHANCE THE FOLLOWING PROMPT with focus on seamless 360° panoramic perfection:`
    } else if (generationType === "360" && panoramaFormat === "stereographic") {
      enhancementInstructions = `You are a professional AI art prompt engineer specializing in 360° stereographic panoramic art. Your task is to enhance this prompt for GODLEVEL PROFESSIONAL STEREOGRAPHIC 360° PROJECTION.

STEREOGRAPHIC REQUIREMENTS:
- Perfect circular fisheye distortion with entire 360° view compressed into circular frame
- Center focus with mathematically precise radial distortion
- Professional stereographic mapping with award-winning precision
- Little planet effect with beautiful curved horizon

Enhancement Level: ${variationType}

ENHANCE THE FOLLOWING PROMPT for stereographic 360° perfection:`
    } else if (generationType === "dome") {
      enhancementInstructions = `You are a professional AI art prompt engineer specializing in dome projection art. Your task is to enhance this prompt for GODLEVEL PROFESSIONAL DOME PROJECTION (${projectionType}).

DOME PROJECTION REQUIREMENTS:
- Perfect ${projectionType} perspective optimized for planetarium dome display
- Immersive viewing experience with mathematical precision
- Professional dome mapping with award-winning quality

Enhancement Level: ${variationType}

ENHANCE THE FOLLOWING PROMPT for dome projection perfection:`
    } else {
      enhancementInstructions = `You are a professional AI art prompt engineer. Your task is to enhance this prompt for GODLEVEL PROFESSIONAL STANDARD ART GENERATION.

STANDARD ART REQUIREMENTS:
- Perfect composition with professional framing
- Museum-quality artistic excellence
- Award-winning visual impact

Enhancement Level: ${variationType}

ENHANCE THE FOLLOWING PROMPT for standard art perfection:`
    }

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: enhancementInstructions,
          },
          {
            role: "user",
            content: basePrompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!chatResponse.ok) {
      const errorData = await chatResponse.json().catch(() => ({}))
      throw new Error(`ChatGPT API error: ${errorData.error?.message || chatResponse.statusText}`)
    }

    const chatData = await chatResponse.json()
    let enhancedPrompt = chatData.choices[0]?.message?.content || basePrompt

    // Ensure seamless wrapping instructions are preserved for 360° equirectangular
    if (generationType === "360" && panoramaFormat === "equirectangular") {
      if (!enhancedPrompt.includes("seamless") && !enhancedPrompt.includes("wraparound")) {
        enhancedPrompt += ` CRITICAL: Perfect seamless horizontal wraparound where left edge connects flawlessly with right edge, zero visible seams, continuous 360° environment, professional VR-quality seamless wrapping.`
      }
    }

    // Sanitize and truncate if needed
    enhancedPrompt = sanitizePrompt(enhancedPrompt)
    if (enhancedPrompt.length > 4000) {
      enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
    }

    // Calculate statistics
    const originalStats = {
      characters: basePrompt.length,
      words: basePrompt.split(/\s+/).length,
    }

    const enhancedStats = {
      characters: enhancedPrompt.length,
      words: enhancedPrompt.split(/\s+/).length,
    }

    console.log("✅ Prompt enhanced successfully")
    console.log(`📊 Original: ${originalStats.characters} chars, ${originalStats.words} words`)
    console.log(`📊 Enhanced: ${enhancedStats.characters} chars, ${enhancedStats.words} words`)

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      originalPrompt: basePrompt,
      statistics: {
        original: originalStats,
        enhanced: enhancedStats,
        improvement: {
          characters: enhancedStats.characters - originalStats.characters,
          words: enhancedStats.words - originalStats.words,
          percentage: Math.round(
            ((enhancedStats.characters - originalStats.characters) / originalStats.characters) * 100,
          ),
        },
      },
      variationType,
      generationType,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Prompt enhancement failed:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enhance prompt",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

// Sanitize prompt to remove potentially problematic content
function sanitizePrompt(prompt: string): string {
  // Remove potentially problematic terms while preserving artistic quality
  const problematicTerms = [
    /\b(nude|naked|explicit|sexual|erotic)\b/gi,
    /\b(violence|violent|blood|gore|death)\b/gi,
    /\b(hate|racist|discrimination)\b/gi,
  ]

  let sanitized = prompt
  problematicTerms.forEach((term) => {
    sanitized = sanitized.replace(term, "artistic")
  })

  return sanitized
}
