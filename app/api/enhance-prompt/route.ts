import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔮 Prompt enhancement request received")

    // Build the base prompt
    const basePrompt = buildPrompt({
      dataset: body.dataset || "vietnamese",
      scenario: body.scenario || "trung-sisters",
      colorScheme: body.colorScheme || "metallic",
      seed: body.seed || 1234,
      numSamples: body.numSamples || 4000,
      noiseScale: body.noiseScale || 0.08,
      customPrompt: body.customPrompt || "",
      panoramic360: body.panoramic360 || false,
      panoramaFormat: body.panoramaFormat || "equirectangular",
      projectionType: body.projectionType || "fisheye",
    })

    const variationType = body.variationType || "moderate"
    const generationType = body.generationType || "standard"

    console.log("📝 Base prompt length:", basePrompt?.length || 0, "characters")

    // Calculate statistics
    const originalStats = {
      characters: basePrompt?.length || 0,
      words: basePrompt?.split(" ").length || 0,
    }

    let enhancedPrompt = basePrompt || ""
    let enhancementMethod = "rule-based"

    // Try ChatGPT enhancement first
    try {
      console.log("🤖 Attempting ChatGPT enhancement...")
      const chatGPTResult = await enhanceWithChatGPT(basePrompt, variationType, generationType)
      if (chatGPTResult && chatGPTResult.length > basePrompt.length) {
        enhancedPrompt = chatGPTResult
        enhancementMethod = "chatgpt"
        console.log("✅ ChatGPT enhancement successful")
      } else {
        throw new Error("ChatGPT enhancement failed or returned shorter prompt")
      }
    } catch (error: any) {
      console.warn("⚠️ ChatGPT enhancement failed, using rule-based fallback:", error.message)
      enhancedPrompt = enhanceWithRules(basePrompt, variationType, generationType)
      enhancementMethod = "rule-based"
    }

    // Ensure we don't exceed 4000 characters
    if (enhancedPrompt.length > 4000) {
      console.log("✂️ Truncating prompt to stay within 4000 character limit")
      enhancedPrompt = intelligentTruncate(enhancedPrompt, generationType)
    }

    const enhancedStats = {
      characters: enhancedPrompt.length,
      words: enhancedPrompt.split(" ").length,
    }

    const improvement = {
      characters: enhancedStats.characters - originalStats.characters,
      words: enhancedStats.words - originalStats.words,
      percentage: Math.round(((enhancedStats.characters - originalStats.characters) / originalStats.characters) * 100),
    }

    console.log("📊 Enhancement complete:", {
      method: enhancementMethod,
      originalLength: originalStats.characters,
      enhancedLength: enhancedStats.characters,
      improvement: improvement.percentage + "%",
    })

    return NextResponse.json({
      success: true,
      originalPrompt: basePrompt,
      enhancedPrompt: enhancedPrompt,
      statistics: {
        original: originalStats,
        enhanced: enhancedStats,
        improvement: improvement,
        maxLength: 4000,
        withinLimit: enhancedPrompt.length <= 4000,
      },
      variationType: variationType,
      generationType: generationType,
      enhancementMethod: enhancementMethod,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Prompt enhancement error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Enhancement failed",
      },
      { status: 500 },
    )
  }
}

// ChatGPT enhancement function
async function enhanceWithChatGPT(basePrompt: string, variationType: string, generationType: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  const enhancementInstructions = {
    slight:
      "Make subtle improvements to artistic quality and technical precision while maintaining the core concept. Add 15-25% more descriptive content.",
    moderate:
      "Significantly enhance artistic quality, add professional technical details, and expand cultural authenticity. Add 40-60% more content.",
    dramatic:
      "Transform into a masterpiece-level prompt with extensive artistic details, professional technical specifications, and rich cultural depth. Add 70-90% more content.",
  }

  const generationContext = {
    standard: "standard artistic composition with perfect framing and professional quality",
    dome: "dome projection with radial composition optimized for planetarium display",
    "360": "360° panoramic view with perfect seamless horizontal wrapping for VR",
  }

  const systemPrompt = `You are a professional AI art prompt engineer specializing in creating GODLEVEL quality prompts for DALL-E 3. Your task is to enhance prompts while maintaining cultural authenticity and technical precision.

ENHANCEMENT LEVEL: ${variationType}
GENERATION TYPE: ${generationType}

Instructions:
- ${enhancementInstructions[variationType as keyof typeof enhancementInstructions]}
- Focus on ${generationContext[generationType as keyof typeof generationContext]}
- Maintain cultural authenticity and respect
- Add professional artistic terminology
- Include technical quality descriptors
- Ensure the prompt stays under 4000 characters
- Preserve the core concept and cultural elements
- Add cinematic lighting and composition details

Return ONLY the enhanced prompt, no explanations or additional text.`

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
          { role: "user", content: `Enhance this prompt: ${basePrompt}` },
        ],
        max_tokens: 1500,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      throw new Error(`ChatGPT API error: ${response.status}`)
    }

    const data = await response.json()
    const enhancedPrompt = data.choices?.[0]?.message?.content?.trim()

    if (!enhancedPrompt || enhancedPrompt.length < basePrompt.length) {
      throw new Error("ChatGPT returned invalid or shorter prompt")
    }

    return enhancedPrompt
  } catch (error: any) {
    console.error("ChatGPT enhancement failed:", error)
    throw error
  }
}

// Rule-based enhancement fallback
function enhanceWithRules(basePrompt: string, variationType: string, generationType: string): string {
  let enhanced = basePrompt

  // Add quality descriptors based on variation type
  const qualityEnhancements = {
    slight: ["professional quality", "enhanced detail", "improved composition", "artistic excellence"],
    moderate: [
      "museum-grade quality",
      "award-winning composition",
      "professional cinematic lighting",
      "ultra-high detail",
      "breathtaking visual impact",
      "artistic mastery",
    ],
    dramatic: [
      "GODLEVEL masterpiece quality",
      "international exhibition grade",
      "transcendent artistic excellence",
      "revolutionary visual impact",
      "legendary artistic achievement",
      "world-class professional standard",
      "breathtaking cinematic perfection",
      "award-winning digital art mastery",
    ],
  }

  // Add generation-specific enhancements
  const generationEnhancements = {
    standard: ["perfect framing and composition", "optimal visual hierarchy", "professional artistic balance"],
    dome: [
      "radial composition optimized for dome projection",
      "planetarium-quality immersive experience",
      "perfect circular symmetry",
    ],
    "360": [
      "seamless horizontal wraparound",
      "perfect left-right edge continuity",
      "VR-optimized immersive experience",
      "professional cylindrical projection",
    ],
  }

  // Apply enhancements
  const qualityTerms =
    qualityEnhancements[variationType as keyof typeof qualityEnhancements] || qualityEnhancements.moderate
  const generationTerms = generationEnhancements[generationType as keyof typeof generationEnhancements] || []

  // Add quality terms
  enhanced += `, ${qualityTerms.slice(0, variationType === "dramatic" ? 4 : variationType === "moderate" ? 3 : 2).join(", ")}`

  // Add generation-specific terms
  if (generationTerms.length > 0) {
    enhanced += `, ${generationTerms.join(", ")}`
  }

  // Add technical specifications
  enhanced += ", 8K HDR resolution, photorealistic detail, professional color grading"

  return enhanced
}

// Intelligent truncation that preserves important information
function intelligentTruncate(prompt: string, generationType: string): string {
  if (prompt.length <= 4000) return prompt

  // Preserve critical phrases for different generation types
  const criticalPhrases = {
    "360": ["LEFT EDGE must connect PERFECTLY with RIGHT EDGE", "seamless", "continuous 360°"],
    dome: ["radial composition", "dome projection", "planetarium"],
    standard: ["professional quality", "artistic excellence"],
  }

  const critical = criticalPhrases[generationType as keyof typeof criticalPhrases] || criticalPhrases.standard

  // Find the last complete sentence that fits within 3900 characters
  let truncated = prompt.substring(0, 3900)
  const lastSentence = truncated.lastIndexOf(".")
  if (lastSentence > 3500) {
    truncated = truncated.substring(0, lastSentence + 1)
  }

  // Ensure critical phrases are preserved
  for (const phrase of critical) {
    if (prompt.includes(phrase) && !truncated.includes(phrase)) {
      // Try to add the critical phrase if there's room
      if (truncated.length + phrase.length + 10 < 4000) {
        truncated += ` ${phrase}.`
      }
    }
  }

  return truncated
}
