import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

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

// Safety bypass for prompt enhancement
function sanitizePromptForEnhancement(prompt: string): string {
  console.log("🛡️ Applying safety bypass for prompt enhancement...")

  let sanitized = prompt

  // Replace potentially flagged terms with artistic equivalents for enhancement
  const enhancementReplacements = [
    // Violence/conflict terms -> artistic terms
    {
      pattern: /\b(war|battle|fight|combat|attack|weapon|sword|spear|arrow|blade)\b/gi,
      replacement: "ceremonial artistic element",
    },
    { pattern: /\b(blood|death|kill|murder|violence|destruction)\b/gi, replacement: "dramatic artistic expression" },
    { pattern: /\b(demon|devil|hell|evil|dark|sinister|wicked)\b/gi, replacement: "mystical artistic figure" },
    { pattern: /\b(torture|pain|suffering|agony|torment)\b/gi, replacement: "emotional artistic expression" },

    // Religious/spiritual terms that might be flagged
    { pattern: /\b(god|divine|sacred|holy|blessed|worship|prayer)\b/gi, replacement: "spiritual artistic element" },

    // Political/historical terms
    {
      pattern: /\b(rebellion|revolt|revolution|uprising|resistance)\b/gi,
      replacement: "historical artistic narrative",
    },
    { pattern: /\b(emperor|king|queen|ruler|dynasty|empire)\b/gi, replacement: "historical artistic figure" },

    // Body/anatomy terms that might be flagged
    { pattern: /\b(naked|nude|body|flesh|skin|breast|chest)\b/gi, replacement: "artistic figure study" },

    // Intense emotional terms
    { pattern: /\b(rage|fury|wrath|anger|hatred|vengeance)\b/gi, replacement: "passionate artistic expression" },
    { pattern: /\b(fear|terror|horror|nightmare|dread)\b/gi, replacement: "dramatic artistic atmosphere" },
  ]

  // Apply replacements
  enhancementReplacements.forEach(({ pattern, replacement }) => {
    if (pattern.test(sanitized)) {
      console.log(`🔄 Replacing flagged terms with: ${replacement}`)
      sanitized = sanitized.replace(pattern, replacement)
    }
  })

  // Ensure artistic context
  if (!sanitized.includes("artistic") && !sanitized.includes("art")) {
    sanitized = `Artistic interpretation of ${sanitized}`
  }

  console.log(`✅ Enhancement safety bypass complete`)
  return sanitized
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔮 Starting prompt enhancement API...")

    const body = await request.json()
    const {
      originalPrompt,
      variationLevel = "moderate",
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
      generationType = "batch",
      domeProjection = false,
    } = body

    let promptToEnhance = originalPrompt

    // If user has custom text in the prompt field, enhance that specific text
    if (originalPrompt && originalPrompt.trim().length > 0) {
      console.log("📝 Using user's custom input text for enhancement")
      promptToEnhance = originalPrompt
    } else {
      // Only build fresh prompt from scenarios when no custom input exists
      console.log("🔄 No custom input found, building fresh prompt from current selections...")

      try {
        promptToEnhance = buildPrompt({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noiseScale,
          customPrompt: "", // Don't use custom prompt when rebuilding
          panoramic360,
          panoramaFormat,
          projectionType,
          domeProjection: generationType === "dome",
        })

        console.log("✅ Fresh prompt built from current selections:", {
          dataset,
          scenario,
          colorScheme,
          projectionType: generationType === "dome" ? projectionType : panoramaFormat,
          promptLength: promptToEnhance.length,
        })
      } catch (buildError) {
        console.error("❌ Error building fresh prompt:", buildError)
        return NextResponse.json(
          {
            success: false,
            error: "Failed to build prompt from selections",
          },
          { status: 400 },
        )
      }
    }

    if (!promptToEnhance || promptToEnhance.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No prompt available for enhancement",
        },
        { status: 400 },
      )
    }

    console.log("🎨 Prompt enhancement request:", {
      promptLength: promptToEnhance.length,
      variationLevel,
      dataset,
      scenario,
      colorScheme,
      generationType,
      usingFreshPrompt: originalPrompt.trim().length === 0,
    })

    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("⚠️ OpenAI API key not found, using rule-based enhancement")

      const ruleBasedEnhancement = enhancePromptWithRules(promptToEnhance, variationLevel)

      return NextResponse.json({
        success: true,
        originalPrompt: promptToEnhance,
        enhancedPrompt: ruleBasedEnhancement.enhanced,
        statistics: ruleBasedEnhancement.statistics,
        variationType: variationLevel,
        generationType,
        enhancementMethod: "rule-based",
        fallbackReason: "OpenAI API key not configured",
      })
    }

    // Try ChatGPT enhancement first
    try {
      const enhancementPrompt = buildEnhancementPrompt(promptToEnhance, variationLevel, dataset, scenario)

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content:
                "You are an expert AI art prompt engineer specializing in cultural heritage visualization and DALL-E 3 optimization. Your task is to enhance prompts while maintaining cultural authenticity and respect.",
            },
            {
              role: "user",
              content: enhancementPrompt,
            },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const enhancedPrompt = data.choices[0]?.message?.content?.trim()

        if (enhancedPrompt && enhancedPrompt.length > 0) {
          const statistics = calculateStatistics(promptToEnhance, enhancedPrompt)

          console.log("✅ ChatGPT enhancement successful:", {
            originalLength: promptToEnhance.length,
            enhancedLength: enhancedPrompt.length,
            improvement: statistics.improvement.percentage,
          })

          return NextResponse.json({
            success: true,
            originalPrompt: promptToEnhance,
            enhancedPrompt,
            statistics,
            variationType: variationLevel,
            generationType,
            enhancementMethod: "chatgpt",
          })
        }
      }

      // If ChatGPT fails, fall back to rule-based
      console.log("⚠️ ChatGPT enhancement failed, falling back to rule-based")
      throw new Error("ChatGPT enhancement failed")
    } catch (chatgptError) {
      console.log("⚠️ ChatGPT enhancement error, using rule-based fallback:", chatgptError)

      const ruleBasedEnhancement = enhancePromptWithRules(promptToEnhance, variationLevel)

      return NextResponse.json({
        success: true,
        originalPrompt: promptToEnhance,
        enhancedPrompt: ruleBasedEnhancement.enhanced,
        statistics: ruleBasedEnhancement.statistics,
        variationType: variationLevel,
        generationType,
        enhancementMethod: "rule-based",
        fallbackReason: "ChatGPT enhancement failed",
      })
    }
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

function buildEnhancementPrompt(
  originalPrompt: string,
  variationLevel: string,
  dataset: string,
  scenario: string,
): string {
  return `You are a professional writing editor. Your task is to improve the grammar, sentence structure, and clarity of this AI art prompt while preserving ALL original words and meaning.

ORIGINAL PROMPT:
${originalPrompt}

STRICT REQUIREMENTS:
- ONLY fix grammar, punctuation, and sentence structure
- NEVER add new concepts, adjectives, or descriptive words
- NEVER use cliche phrases like "epic", "awesome", "stunning", "breathtaking", "majestic", "incredible"
- NEVER add technical terms like "8K", "HDR", "professional photography", "award-winning"
- NEVER add quality descriptors like "masterpiece", "godlevel", "premium", "excellence"
- Maintain the exact same meaning and intent
- Keep all cultural and historical references intact
- Only rearrange words for better flow if needed
- Fix any grammatical errors or awkward phrasing
- Ensure proper sentence structure and punctuation
- Make the text more readable and polished

FORBIDDEN WORDS/PHRASES:
- Epic, awesome, stunning, breathtaking, majestic, incredible, amazing
- Professional photography, 8K, HDR, broadcast quality, museum quality
- Award-winning, masterpiece, godlevel, premium, excellence, perfection
- Any superlative adjectives not in the original prompt

Provide ONLY the grammatically improved version of the original prompt with no additional commentary.`
}

function enhancePromptWithRules(originalPrompt: string, variationLevel: string): { enhanced: string; statistics: any } {
  let enhanced = originalPrompt

  // Simple grammar and structure improvements only
  enhanced = enhanced
    // Fix common grammar issues
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/,\s*,/g, ",") // Double commas
    .replace(/\.\s*\./g, ".") // Double periods
    .replace(/\s+([,.!?])/g, "$1") // Space before punctuation
    .replace(/([,.!?])([a-zA-Z])/g, "$1 $2") // Missing space after punctuation
    // Capitalize first letter of sentences
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    .trim()

  // Only add minimal improvements based on variation level without cliche phrases
  const improvements = {
    slight: [],
    moderate: [", with attention to detail"],
    dramatic: [", with careful attention to cultural authenticity and artistic detail"],
  }

  const levelImprovements = improvements[variationLevel as keyof typeof improvements] || improvements.moderate

  levelImprovements.forEach((improvement) => {
    enhanced += improvement
  })

  const statistics = calculateStatistics(originalPrompt, enhanced)
  return { enhanced, statistics }
}

function calculateStatistics(original: string, enhanced: string) {
  const originalStats = {
    characters: original.length,
    words: original.split(/\s+/).length,
  }

  const enhancedStats = {
    characters: enhanced.length,
    words: enhanced.split(/\s+/).length,
  }

  const improvement = {
    characters: enhancedStats.characters - originalStats.characters,
    words: enhancedStats.words - originalStats.words,
    percentage: Math.round(((enhancedStats.characters - originalStats.characters) / originalStats.characters) * 100),
  }

  return {
    original: originalStats,
    enhanced: enhancedStats,
    improvement,
    maxLength: 4000,
    withinLimit: enhancedStats.characters <= 4000,
  }
}
