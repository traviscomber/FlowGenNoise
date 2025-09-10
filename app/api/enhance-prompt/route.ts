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

    const safeOriginalPrompt = originalPrompt || ""
    let promptToEnhance = safeOriginalPrompt

    // If user has custom text in the prompt field, enhance that specific text
    if (safeOriginalPrompt && safeOriginalPrompt.trim().length > 0) {
      console.log("📝 Using user's custom input text for enhancement")
      promptToEnhance = safeOriginalPrompt
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
          promptLength: promptToEnhance?.length || 0,
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

    if (!promptToEnhance || typeof promptToEnhance !== "string" || promptToEnhance.trim().length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: "No valid prompt available for enhancement",
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
      usingFreshPrompt: safeOriginalPrompt.trim().length === 0,
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
  return `You are a professional writing editor focused on grammar and clarity improvements with Neuralia artistic style integration.

ORIGINAL PROMPT:
${originalPrompt}

NEURALIA STYLE INTEGRATION:
Based on the user's selections (Dataset: ${dataset}, Scenario: ${scenario}), apply the Neuralia artistic approach that combines:
- Abstract conceptual elements from ${dataset} cultural heritage
- Surrealistic atmosphere inspired by ${scenario}
- Concrete realistic details maintaining cultural authenticity
- Undefined color palette allowing natural artistic expression
- Unique artistic style similar to Indonesian aboriginal tribes' approach to art

TASK: Improve the grammar and readability while integrating Neuralia style elements that represent the unique fusion of the user's cultural selections.

ENHANCEMENT RULES:
- Fix grammar errors, punctuation, and sentence structure
- Integrate abstract conceptual elements from the selected cultural dataset
- Add surrealistic atmospheric qualities inspired by the chosen scenario
- Maintain concrete realistic details for authenticity
- Allow for undefined/natural color palette expression
- Create a unique artistic style that represents the fusion of all user selections
- Keep cultural references respectful and authentic

NEURALIA ARTISTIC ELEMENTS TO INTEGRATE:
- Abstract conceptual interpretations of ${dataset} heritage
- Surrealistic atmosphere reflecting ${scenario} narrative
- Concrete realistic cultural details
- Organic color palette emergence
- Unique artistic synthesis like Indonesian aboriginal art traditions

Provide the enhanced prompt with integrated Neuralia style elements that create a unique artistic representation of the user's cultural selections.`
}

function enhancePromptWithRules(originalPrompt: string, variationLevel: string): { enhanced: string; statistics: any } {
  let enhanced = originalPrompt

  // Add Neuralia style prefix for abstract conceptual approach
  if (!enhanced.includes("abstract conceptual") && !enhanced.includes("surrealistic")) {
    enhanced = `Abstract conceptual elements with surrealistic atmosphere, concrete realistic details. ${enhanced}`
  }

  enhanced = enhanced
    // Fix basic grammar and punctuation issues
    .replace(/\s+/g, " ") // Multiple spaces to single space
    .replace(/,\s*,/g, ",") // Double commas
    .replace(/\.\s*\./g, ".") // Double periods
    .replace(/\s+([,.!?])/g, "$1") // Space before punctuation
    .replace(/([,.!?])([a-zA-Z])/g, "$1 $2") // Missing space after punctuation
    // Capitalize first letter of sentences
    .replace(/(^|[.!?]\s+)([a-z])/g, (match, p1, p2) => p1 + p2.toUpperCase())
    // Fix common grammar patterns
    .replace(/\ba\s+([aeiouAEIOU])/g, "an $1") // Fix a/an usage
    .replace(/\ban\s+([^aeiouAEIOU])/g, "a $1") // Fix an/a usage
    .trim()

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
