import { type NextRequest, NextResponse } from "next/server"

// Rule-based prompt enhancement (fallback when OpenAI is unavailable)
function enhancePromptWithRules(prompt: string, level: string): string {
  console.log(`🎨 Applying rule-based ${level} enhancement...`)

  const baseEnhancements = {
    quality: [
      "museum-quality",
      "award-winning",
      "professional",
      "masterpiece",
      "premium",
      "godlevel",
      "ultra-high definition",
      "8K resolution",
      "HDR quality",
      "broadcast standard",
    ],
    artistic: [
      "artistic excellence",
      "visual masterpiece",
      "creative brilliance",
      "aesthetic perfection",
      "artistic sophistication",
      "cultural authenticity",
      "heritage preservation",
      "traditional artistry",
      "contemporary interpretation",
      "timeless beauty",
    ],
    technical: [
      "perfect composition",
      "optimal lighting",
      "cinematic quality",
      "professional photography",
      "expert craftsmanship",
      "technical precision",
      "color accuracy",
      "sharp detail",
      "balanced exposure",
      "artistic framing",
    ],
    cultural: [
      "respectful representation",
      "cultural appreciation",
      "heritage celebration",
      "traditional honor",
      "educational value",
      "scholarly documentation",
      "authentic portrayal",
      "cultural significance",
      "historical accuracy",
      "artistic tribute",
    ],
  }

  let enhanced = prompt

  // Apply enhancements based on level
  const enhancementCount = level === "slight" ? 2 : level === "moderate" ? 4 : 6

  // Add quality descriptors
  const qualityTerms = baseEnhancements.quality.slice(0, enhancementCount)
  enhanced += `, ${qualityTerms.join(", ")}`

  // Add artistic terms
  const artisticTerms = baseEnhancements.artistic.slice(0, Math.ceil(enhancementCount / 2))
  enhanced += `, ${artisticTerms.join(", ")}`

  // Add technical terms for moderate and dramatic
  if (level !== "slight") {
    const technicalTerms = baseEnhancements.technical.slice(0, Math.ceil(enhancementCount / 3))
    enhanced += `, ${technicalTerms.join(", ")}`
  }

  // Add cultural terms for dramatic
  if (level === "dramatic") {
    const culturalTerms = baseEnhancements.cultural.slice(0, 3)
    enhanced += `, ${culturalTerms.join(", ")}`
  }

  console.log(`✅ Rule-based enhancement complete (${prompt.length} → ${enhanced.length} chars)`)
  return enhanced
}

// OpenAI-based prompt enhancement
async function enhancePromptWithOpenAI(prompt: string, level: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  console.log(`🤖 Attempting OpenAI ${level} enhancement...`)

  const enhancementInstructions = {
    slight:
      "Slightly enhance this art generation prompt by adding 2-3 quality descriptors while maintaining the original meaning and cultural authenticity.",
    moderate:
      "Moderately enhance this art generation prompt by adding artistic quality terms, technical photography details, and cultural respect elements while preserving the core concept.",
    dramatic:
      "Dramatically enhance this art generation prompt by adding comprehensive artistic excellence terms, professional photography specifications, cultural heritage appreciation, and museum-quality descriptors while maintaining respectful authenticity.",
  }

  const systemPrompt = `You are an expert art prompt enhancer specializing in cultural heritage and artistic excellence. Your task is to enhance art generation prompts while maintaining cultural authenticity and respect.

Guidelines:
- Preserve the original cultural context and meaning
- Add appropriate artistic and technical quality terms
- Maintain respectful and educational tone
- Focus on museum-quality and professional standards
- Ensure cultural sensitivity and authenticity
- Keep enhancements relevant to the original subject

Enhancement level: ${level}
Instruction: ${enhancementInstructions[level as keyof typeof enhancementInstructions]}

Return only the enhanced prompt, no explanations.`

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim()

    if (!enhancedPrompt) {
      throw new Error("No enhanced prompt returned from OpenAI")
    }

    console.log(`✅ OpenAI enhancement complete (${prompt.length} → ${enhancedPrompt.length} chars)`)
    return enhancedPrompt
  } catch (error: any) {
    console.error("❌ OpenAI enhancement failed:", error.message)
    throw error
  }
}

export async function POST(request: NextRequest) {
  console.log("🎨 Prompt enhancement API called")

  try {
    const body = await request.json()
    const { prompt, enhancementLevel = "moderate" } = body

    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid prompt provided",
        },
        { status: 400 },
      )
    }

    if (!["slight", "moderate", "dramatic"].includes(enhancementLevel)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid enhancement level. Must be 'slight', 'moderate', or 'dramatic'",
        },
        { status: 400 },
      )
    }

    console.log(`📝 Enhancing prompt (${prompt.length} chars) with ${enhancementLevel} level`)

    let enhancedPrompt: string
    let method: string

    // Try OpenAI enhancement first
    try {
      enhancedPrompt = await enhancePromptWithOpenAI(prompt, enhancementLevel)
      method = "OpenAI GPT-4"
    } catch (openaiError: any) {
      console.log(`⚠️ OpenAI enhancement failed: ${openaiError.message}`)
      console.log("🔄 Falling back to rule-based enhancement...")

      // Fallback to rule-based enhancement
      enhancedPrompt = enhancePromptWithRules(prompt, enhancementLevel)
      method = "Rule-based"
    }

    // Ensure the enhanced prompt isn't too long
    if (enhancedPrompt.length > 4000) {
      console.log("✂️ Truncating enhanced prompt to 4000 characters...")
      enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
    }

    console.log(`✅ Prompt enhancement successful using ${method}`)

    return NextResponse.json({
      success: true,
      enhancedPrompt,
      method,
      originalLength: prompt.length,
      enhancedLength: enhancedPrompt.length,
      enhancementLevel,
    })
  } catch (error: any) {
    console.error("❌ Prompt enhancement error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to enhance prompt",
        details: error.stack || "No additional details available",
      },
      { status: 500 },
    )
  }
}
