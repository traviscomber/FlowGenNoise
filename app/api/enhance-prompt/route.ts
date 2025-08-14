import { type NextRequest, NextResponse } from "next/server"
import { buildPrompt } from "@/lib/ai-prompt"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔮 Prompt enhancement request received")

    // Build the original prompt
    const originalPrompt = buildPrompt({
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

    if (!originalPrompt) {
      throw new Error("Failed to build original prompt")
    }

    console.log("📝 Original prompt built:", originalPrompt.substring(0, 100) + "...")

    let enhancedPrompt = originalPrompt
    let enhancementMethod = "rule-based"

    // Try ChatGPT enhancement first
    try {
      console.log("🤖 Attempting ChatGPT enhancement...")

      const variationType = body.variationType || "moderate"
      const generationType = body.generationType || "standard"

      const enhancementInstructions = {
        slight:
          "Enhance this AI art prompt by 20% with subtle improvements to artistic quality, technical details, and visual appeal. Keep the core content but add professional artistic terminology and quality descriptors.",
        moderate:
          "Enhance this AI art prompt by 50% with significant improvements to artistic quality, cultural authenticity, technical specifications, and visual impact. Add professional artistic terminology, cultural context, and technical excellence descriptors.",
        dramatic:
          "Dramatically enhance this AI art prompt by 80% with maximum improvements to artistic quality, cultural depth, technical mastery, and breathtaking visual impact. Transform it into a museum-quality artistic masterpiece description with rich cultural context and professional excellence.",
      }

      const systemPrompt = `You are a professional AI art prompt engineer specializing in creating GODLEVEL quality prompts for ${generationType} image generation. Your task is to enhance prompts for maximum artistic impact while maintaining cultural authenticity and technical excellence.

ENHANCEMENT GUIDELINES:
- Preserve all original cultural and technical content
- Add professional artistic terminology and quality descriptors
- Enhance visual impact and artistic excellence descriptions
- Maintain cultural authenticity and respect
- Keep within 4000 character limit
- Focus on ${generationType === "360" ? "seamless 360° VR optimization" : generationType === "dome" ? "dome projection optimization" : "standard artistic composition"}

${generationType === "360" ? "CRITICAL FOR 360°: Ensure seamless wrapping instructions are preserved and enhanced - LEFT EDGE must connect PERFECTLY with RIGHT EDGE." : ""}

Enhancement Level: ${enhancementInstructions[variationType as keyof typeof enhancementInstructions]}`

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Enhance this prompt: ${originalPrompt}` },
          ],
          max_tokens: 1500,
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const chatgptEnhanced = data.choices[0]?.message?.content?.trim()

        if (chatgptEnhanced && chatgptEnhanced.length > originalPrompt.length) {
          enhancedPrompt = chatgptEnhanced
          enhancementMethod = "chatgpt"
          console.log("✅ ChatGPT enhancement successful")
        } else {
          throw new Error("ChatGPT enhancement failed or too short")
        }
      } else {
        throw new Error(`ChatGPT API error: ${response.status}`)
      }
    } catch (chatgptError: any) {
      console.warn("⚠️ ChatGPT enhancement failed, using rule-based fallback:", chatgptError.message)

      // Rule-based enhancement fallback
      const variationType = body.variationType || "moderate"
      const generationType = body.generationType || "standard"

      const qualityEnhancements = {
        slight: "professional artistic quality, enhanced visual appeal, refined composition",
        moderate:
          "museum-grade artistic excellence, award-winning visual impact, professional cinematic quality, enhanced cultural authenticity",
        dramatic:
          "GODLEVEL artistic mastery, international exhibition quality, breathtaking visual magnificence, transcendent artistic excellence, professional broadcast standard, award-winning cultural authenticity",
      }

      const typeSpecificEnhancements = {
        standard: "perfect composition balance, optimal framing, professional artistic standards",
        dome: `optimized for ${body.projectionType || "fisheye"} dome projection, planetarium-grade quality, immersive radial composition`,
        "360":
          body.panoramaFormat === "equirectangular"
            ? "CRITICAL SEAMLESS WRAPPING: LEFT EDGE connects PERFECTLY with RIGHT EDGE, VR-optimized, museum-grade 360° immersion"
            : "perfect stereographic projection, circular fisheye composition, little planet effect mastery",
      }

      enhancedPrompt = `${originalPrompt}, ${qualityEnhancements[variationType as keyof typeof qualityEnhancements]}, ${typeSpecificEnhancements[generationType as keyof typeof typeSpecificEnhancements]}`

      // Ensure we don't exceed 4000 characters
      if (enhancedPrompt.length > 4000) {
        enhancedPrompt = enhancedPrompt.substring(0, 3900) + "..."
      }
    }

    // Calculate statistics
    const originalStats = {
      characters: originalPrompt.length,
      words: originalPrompt.split(/\s+/).length,
    }

    const enhancedStats = {
      characters: enhancedPrompt.length,
      words: enhancedPrompt.split(/\s+/).length,
    }

    const improvement = {
      characters: enhancedStats.characters - originalStats.characters,
      words: enhancedStats.words - originalStats.words,
      percentage: Math.round(((enhancedStats.characters - originalStats.characters) / originalStats.characters) * 100),
    }

    console.log(`✅ Prompt enhancement completed using ${enhancementMethod}`)
    console.log(`📊 Enhancement stats: +${improvement.characters} chars (+${improvement.percentage}%)`)

    return NextResponse.json({
      success: true,
      originalPrompt,
      enhancedPrompt,
      statistics: {
        original: originalStats,
        enhanced: enhancedStats,
        improvement,
        maxLength: 4000,
        withinLimit: enhancedStats.characters <= 4000,
      },
      variationType: body.variationType || "moderate",
      generationType: body.generationType || "standard",
      enhancementMethod,
      timestamp: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("❌ Prompt enhancement error:", error)

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Enhancement failed",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
