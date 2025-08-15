import { type NextRequest, NextResponse } from "next/server"

// Validate OpenAI API key with detailed logging
function validateApiKey(): { isValid: boolean; error?: string; details?: any } {
  console.log("🔍 Validating OpenAI API Key for prompt enhancement...")

  const apiKey = process.env.OPENAI_API_KEY

  // Check if API key exists
  if (!apiKey) {
    const error = "OpenAI API key not found in environment variables"
    console.error("❌ API Key Error:", error)
    console.log(
      "📋 Available env vars:",
      Object.keys(process.env).filter((key) => key.includes("OPENAI")),
    )
    return {
      isValid: false,
      error,
      details: {
        envVars: Object.keys(process.env).filter((key) => key.includes("OPENAI")),
        suggestion: "Add OPENAI_API_KEY to your environment variables",
      },
    }
  }

  // Check API key format
  if (!apiKey.startsWith("sk-")) {
    const error = "Invalid OpenAI API key format (must start with 'sk-')"
    console.error("❌ API Key Format Error:", error)
    return {
      isValid: false,
      error,
      details: {
        keyPrefix: apiKey.substring(0, 5) + "...",
        suggestion: "Ensure your API key starts with 'sk-'",
      },
    }
  }

  // Check API key length
  if (apiKey.length < 20) {
    const error = "OpenAI API key appears to be too short"
    console.error("❌ API Key Length Error:", error)
    return {
      isValid: false,
      error,
      details: {
        keyLength: apiKey.length,
        suggestion: "Verify you have the complete API key",
      },
    }
  }

  console.log("✅ API Key validation passed for enhancement")
  console.log("🔑 Key format:", apiKey.substring(0, 7) + "..." + apiKey.substring(apiKey.length - 4))

  return {
    isValid: true,
    details: {
      keyPrefix: apiKey.substring(0, 7) + "...",
      keyLength: apiKey.length,
    },
  }
}

// Enhanced prompt generation with ChatGPT
async function enhancePromptWithChatGPT(
  originalPrompt: string,
  variationLevel = "moderate",
  dataset: string,
  scenario: string,
): Promise<{ success: boolean; enhancedPrompt?: string; error?: string; usage?: any }> {
  console.log("🤖 Starting ChatGPT prompt enhancement...")
  console.log("📝 Original prompt length:", originalPrompt.length)
  console.log("🎚️ Variation level:", variationLevel)
  console.log("🗂️ Dataset:", dataset)
  console.log("🎭 Scenario:", scenario)

  // Validate API key first
  const validation = validateApiKey()
  if (!validation.isValid) {
    console.error("❌ API key validation failed:", validation.error)
    return { success: false, error: validation.error }
  }

  const apiKey = process.env.OPENAI_API_KEY!

  try {
    // Create enhancement instructions based on variation level
    let enhancementInstructions = ""
    switch (variationLevel) {
      case "slight":
        enhancementInstructions =
          "Make subtle improvements to the prompt, adding 15-25% more descriptive details while maintaining the core concept. Focus on enhancing visual quality, lighting, and artistic style."
        break
      case "moderate":
        enhancementInstructions =
          "Enhance the prompt significantly, adding 40-60% more content. Add rich visual details, atmospheric elements, cultural authenticity, and professional quality descriptors. Maintain the original concept but make it much more vivid and detailed."
        break
      case "dramatic":
        enhancementInstructions =
          "Dramatically transform and enhance the prompt, adding 70-100% more content. Create a masterpiece-level description with extensive visual details, cultural context, artistic techniques, lighting effects, and professional quality indicators. Make it truly spectacular while preserving the core theme."
        break
      default:
        enhancementInstructions =
          "Enhance the prompt with balanced improvements, adding meaningful details and professional quality descriptors."
    }

    const systemPrompt = `You are an expert AI art prompt engineer specializing in creating GODLEVEL quality prompts for DALL-E 3. Your task is to enhance art generation prompts to achieve museum-quality, professional results.

ENHANCEMENT GUIDELINES:
- ${enhancementInstructions}
- Maintain cultural authenticity and respect
- Add professional photography/art terminology
- Include lighting, composition, and quality descriptors
- Ensure the prompt stays under 4000 characters
- Preserve the original concept and intent
- Add artistic style and technical quality indicators

DATASET CONTEXT: ${dataset}
SCENARIO CONTEXT: ${scenario}

Please enhance the following prompt:`

    console.log("🚀 Sending request to OpenAI ChatGPT API...")

    // Make request to OpenAI ChatGPT
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          {
            role: "user",
            content: originalPrompt,
          },
        ],
        max_tokens: 1500,
        temperature: variationLevel === "slight" ? 0.3 : variationLevel === "dramatic" ? 0.9 : 0.6,
        top_p: 0.9,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: { message: "Unknown API error" } }))
      console.error("❌ ChatGPT API error:", response.status, errorData)

      // Handle specific error types
      if (response.status === 401) {
        throw new Error("Invalid OpenAI API key - authentication failed")
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded - please try again in a moment")
      } else if (response.status >= 500) {
        throw new Error("OpenAI service temporarily unavailable")
      } else {
        throw new Error(`API error: ${errorData.error?.message || "Unknown error"}`)
      }
    }

    const data = await response.json()

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error("Invalid response from ChatGPT - no message content")
    }

    const enhancedPrompt = data.choices[0].message.content.trim()

    // Validate enhanced prompt
    if (!enhancedPrompt || enhancedPrompt.length < 50) {
      throw new Error("Enhanced prompt is too short or empty")
    }

    // Ensure enhanced prompt is within limits
    const finalPrompt = enhancedPrompt.length > 4000 ? enhancedPrompt.substring(0, 3900) + "..." : enhancedPrompt

    console.log(`✅ Enhancement successful (${originalPrompt.length} → ${finalPrompt.length} chars)`)

    return {
      success: true,
      enhancedPrompt: finalPrompt,
      usage: data.usage,
    }
  } catch (error: any) {
    console.error("❌ Enhancement error:", error)

    if (error.name === "AbortError") {
      return { success: false, error: "Request timed out - please try again" }
    }

    return { success: false, error: error.message || "Enhancement failed" }
  }
}

// Rule-based enhancement fallback
function enhancePromptRuleBased(originalPrompt: string, variationLevel: string): string {
  console.log("🔄 Using rule-based enhancement fallback")

  let enhanced = originalPrompt

  // Add quality descriptors based on variation level
  const qualityTerms = [
    "museum-grade professional quality",
    "award-winning composition",
    "ultra-high definition",
    "cinematic lighting",
    "breathtaking visual impact",
    "8K HDR",
    "photorealistic detail",
    "masterful artistic excellence",
  ]

  const atmosphericTerms = [
    "dramatic lighting effects",
    "rich color palette",
    "perfect composition",
    "professional photography style",
    "artistic masterpiece quality",
  ]

  // Enhancement based on variation level
  switch (variationLevel) {
    case "slight":
      enhanced += `, ${qualityTerms.slice(0, 2).join(", ")}`
      break
    case "moderate":
      enhanced += `, ${qualityTerms.slice(0, 4).join(", ")}, ${atmosphericTerms.slice(0, 2).join(", ")}`
      break
    case "dramatic":
      enhanced += `, ${qualityTerms.join(", ")}, ${atmosphericTerms.join(", ")}, godlevel artistic vision, transcendent visual experience`
      break
  }

  console.log(`✅ Rule-based enhancement complete (${originalPrompt.length} → ${enhanced.length} chars)`)
  return enhanced
}

// Calculate enhancement statistics
function calculateStatistics(original: string, enhanced: string) {
  const originalChars = original.length
  const originalWords = original.split(/\s+/).length
  const enhancedChars = enhanced.length
  const enhancedWords = enhanced.split(/\s+/).length

  const charImprovement = enhancedChars - originalChars
  const wordImprovement = enhancedWords - originalWords
  const percentage = originalChars > 0 ? Math.round((charImprovement / originalChars) * 100) : 0

  return {
    original: { characters: originalChars, words: originalWords },
    enhanced: { characters: enhancedChars, words: enhancedWords },
    improvement: { characters: charImprovement, words: wordImprovement, percentage },
    maxLength: 4000,
    withinLimit: enhancedChars <= 4000,
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔮 Starting prompt enhancement API...")

    const body = await request.json()
    const { originalPrompt, variationLevel = "moderate", dataset = "vietnamese", scenario = "trung-sisters" } = body

    // Validate input
    if (!originalPrompt || typeof originalPrompt !== "string") {
      console.error("❌ Invalid input: originalPrompt is required")
      return NextResponse.json(
        {
          success: false,
          error: "Original prompt is required and must be a string",
        },
        { status: 400 },
      )
    }

    if (originalPrompt.length > 5000) {
      console.error("❌ Invalid input: originalPrompt too long")
      return NextResponse.json(
        {
          success: false,
          error: "Original prompt is too long (max 5000 characters)",
        },
        { status: 400 },
      )
    }

    console.log(`📝 Original prompt: ${originalPrompt.substring(0, 100)}...`)
    console.log(`🎚️ Variation level: ${variationLevel}`)
    console.log(`🗂️ Dataset: ${dataset}`)
    console.log(`🎭 Scenario: ${scenario}`)

    // Try ChatGPT enhancement first
    const result = await enhancePromptWithChatGPT(originalPrompt, variationLevel, dataset, scenario)

    if (result.success) {
      console.log("✅ ChatGPT enhancement successful")
      return NextResponse.json({
        success: true,
        enhancedPrompt: result.enhancedPrompt,
        originalPrompt,
        statistics: calculateStatistics(originalPrompt, result.enhancedPrompt || ""),
        variationType: variationLevel,
        generationType: "standard",
        enhancementMethod: "chatgpt",
        usage: result.usage,
        timestamp: new Date().toISOString(),
      })
    } else {
      console.log("⚠️ ChatGPT enhancement failed, trying rule-based fallback...")

      // Fallback to rule-based enhancement
      const fallbackEnhanced = enhancePromptRuleBased(originalPrompt, variationLevel)

      return NextResponse.json({
        success: true,
        enhancedPrompt: fallbackEnhanced,
        originalPrompt,
        statistics: calculateStatistics(originalPrompt, fallbackEnhanced),
        variationType: variationLevel,
        generationType: "standard",
        enhancementMethod: "rule-based-fallback",
        message: `ChatGPT enhancement failed (${result.error}), used rule-based enhancement`,
        chatgptError: result.error,
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error: any) {
    console.error("❌ Enhance prompt API error:", error)

    // Try to parse the request body for fallback
    try {
      const body = await request.json()
      const fallbackEnhanced = enhancePromptRuleBased(
        body.originalPrompt || "Beautiful artistic scene",
        body.variationLevel || "moderate",
      )

      return NextResponse.json({
        success: true,
        enhancedPrompt: fallbackEnhanced,
        originalPrompt: body.originalPrompt || "",
        statistics: calculateStatistics(body.originalPrompt || "", fallbackEnhanced),
        variationType: body.variationLevel || "moderate",
        generationType: "standard",
        enhancementMethod: "emergency-fallback",
        message: "Used emergency rule-based enhancement due to API error",
        apiError: error.message,
        timestamp: new Date().toISOString(),
      })
    } catch (fallbackError) {
      console.error("❌ Emergency fallback also failed:", fallbackError)
      return NextResponse.json(
        {
          success: false,
          error: `Enhancement failed: ${error.message || "Unknown error"}`,
          details: {
            originalError: error.message,
            fallbackError: fallbackError.message,
          },
        },
        { status: 500 },
      )
    }
  }
}
