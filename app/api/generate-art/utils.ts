export async function callOpenAI(prompt: string): Promise<string> {
  const maxRetries = 3
  const baseDelay = 2000 // 2 seconds

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 OpenAI API attempt ${attempt}/${maxRetries}`)
      console.log(`📝 Prompt length: ${prompt.length} characters`)

      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "dall-e-3",
          prompt: prompt,
          n: 1,
          size: "1024x1024",
          quality: "hd",
          response_format: "url",
        }),
        signal: AbortSignal.timeout(120000), // 2 minute timeout
      })

      console.log(`📡 OpenAI API response status: ${response.status}`)
      console.log(`📡 OpenAI API response headers:`, Object.fromEntries(response.headers.entries()))

      // Get response text first to handle non-JSON responses
      const responseText = await response.text()
      console.log(`📄 Response text preview: ${responseText.substring(0, 200)}...`)

      // Check if response is JSON
      let responseData
      try {
        // Validate JSON format before parsing
        if (responseText.trim().startsWith("{") || responseText.trim().startsWith("[")) {
          responseData = JSON.parse(responseText)
        } else {
          throw new Error(`Non-JSON response received: ${responseText.substring(0, 200)}...`)
        }
      } catch (parseError: any) {
        console.error(`❌ JSON parsing failed:`, parseError.message)
        throw new Error(`Invalid JSON response: ${responseText.substring(0, 200)}...`)
      }

      if (!response.ok) {
        const errorMessage = responseData?.error?.message || `HTTP ${response.status}: ${response.statusText}`
        console.error(`❌ OpenAI API error response:`, responseData)

        // Determine if we should retry based on status code
        const shouldRetry = response.status >= 500 || response.status === 429 || response.status === 503

        if (shouldRetry && attempt < maxRetries) {
          const delay =
            response.status === 429
              ? baseDelay * Math.pow(2, attempt) * 2 // Longer delay for rate limits
              : baseDelay * Math.pow(2, attempt - 1) // Exponential backoff for server errors

          console.log(`⏳ Retrying in ${delay}ms due to ${response.status} error...`)
          await new Promise((resolve) => setTimeout(resolve, delay))
          continue
        }

        throw new Error(`OpenAI API error: ${response.status} - ${errorMessage}`)
      }

      // Validate response structure
      if (!responseData?.data?.[0]?.url) {
        console.error(`❌ Invalid response structure:`, responseData)
        throw new Error("Invalid response structure: missing image URL")
      }

      const imageUrl = responseData.data[0].url
      console.log(`✅ OpenAI API success: ${imageUrl.substring(0, 50)}...`)
      return imageUrl
    } catch (error: any) {
      console.error(`❌ OpenAI API attempt ${attempt} failed:`, error.message)

      // Don't retry on certain errors
      if (
        error.message.includes("Invalid JSON") ||
        error.message.includes("400") ||
        error.message.includes("401") ||
        error.message.includes("403")
      ) {
        throw error
      }

      // If this was the last attempt, throw the error
      if (attempt === maxRetries) {
        throw new Error(`OpenAI API call failed after ${maxRetries} attempts: ${error.message}`)
      }

      // Wait before retrying (exponential backoff)
      const delay = baseDelay * Math.pow(2, attempt - 1)
      console.log(`⏳ Waiting ${delay}ms before retry...`)
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
  }

  throw new Error("OpenAI API call failed: Maximum retries exceeded")
}

export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "8K",
  projectionType = "fisheye",
): string {
  // Check if this is a COSMOS generation
  const isCOSMOS = basePrompt.includes("COSMOS") || basePrompt.includes("cosmic") || basePrompt.includes("spiral")

  const cosmosEnhancement = isCOSMOS
    ? `

COSMOS DOME TUNNEL UP ENHANCEMENTS:
- COSMIC SPIRAL GALAXIES flowing in tunnel formation toward dome zenith
- STELLAR MATHEMATICAL FORMATIONS creating radial cosmic patterns
- GALACTIC FRACTAL STRUCTURES spiraling upward through dome tunnel
- NEBULA MATHEMATICAL PATTERNS with cosmic algorithmic precision
- COSMIC GEOMETRIC HARMONY optimized for dome ceiling projection
- STELLAR COMPUTATIONAL ART with galactic mathematical beauty
- ASTRONOMICAL ALGORITHMIC STRUCTURES creating infinite cosmic depth
- COSMIC MATHEMATICAL PRECISION with stellar geometric patterns
- GALACTIC TUNNEL VORTEX with cosmic spiral mathematics
- NEBULA COMPUTATIONAL EFFECTS with stellar algorithmic beauty`
    : ""

  return `IMMERSIVE ${diameter}M PLANETARIUM DOME WITH DRAMATIC TUNNEL UP EFFECT: Transform this extraordinary artwork into a breathtaking ${diameter}-meter planetarium dome projection with stunning TUNNEL UP perspective effect optimized for overhead dome ceiling viewing.

DOME TUNNEL UP SPECIFICATIONS FOR ${diameter}M DOME:
- DRAMATIC TUNNEL UP EFFECT with mathematical precision creating immersive upward-looking perspective
- POWERFUL CENTRAL FOCAL POINT at zenith drawing viewers' eyes upward through cosmic tunnel
- RADIAL PATTERNS flowing outward from center zenith in perfect circular symmetry for dome ceiling
- FISHEYE LENS DISTORTION creating immersive 180-degree field of view perfect for overhead viewing
- CIRCULAR COMPOSITION BOUNDARY perfectly fitted for ${diameter}m dome projection systems
- SEAMLESS EDGE BLENDING with computational precision for perfect dome environment immersion
- DRAMATIC PERSPECTIVE DISTORTION using mathematical curves optimized for dome ceiling display
- TUNNEL VORTEX EFFECT spiraling upward toward central vanishing point at dome apex
- ZENITH FOCUS POINT creating sense of looking up through infinite cosmic tunnel
- SPHERICAL MAPPING with enhanced peripheral detail for complete dome coverage
- ${resolution} RESOLUTION optimized for professional planetarium projection systems
- ASTRONOMICAL PROJECTION STANDARDS with fulldome cinema format compatibility
- IMMERSIVE OVERHEAD VIEWING EXPERIENCE designed for audience looking up at dome ceiling
- PLANETARIUM-GRADE VISUAL QUALITY with seamless wraparound immersion${cosmosEnhancement}

MATHEMATICAL TUNNEL UP ARTISTIC VISION:
${basePrompt}

DOME CEILING TRANSFORMATION REQUIREMENTS:
Transform this magnificent concept into a dramatic TUNNEL UP EFFECT specifically for ${diameter}-meter planetarium dome ceiling projection. The composition must feature a powerful central focal point at the dome's zenith with all elements radiating outward in perfect radial symmetry, creating an absolutely breathtaking tunnel illusion when viewers look up at the ${diameter}m dome ceiling above them.

TUNNEL UP EFFECT SPECIFICATIONS:
- Central vanishing point at dome zenith creating upward tunnel perspective
- Radial flow patterns expanding outward from center for dome ceiling viewing
- Fisheye distortion with computational accuracy for seamless overhead projection
- Circular boundary perfectly fitted for dome projection systems
- Mathematical tunnel vortex spiraling upward toward dome apex
- Dramatic upward perspective depth using mathematical curves and geometric progression
- Seamless circular edge blending for perfect dome ceiling environment immersion

FINAL DOME TUNNEL UP VISION: Create a breathtaking artwork that completely transforms the ${diameter}m dome ceiling into an immersive upward tunnel experience, with dramatic TUNNEL UP effects, radial patterns, and algorithmic depth illusion - all optimized for overhead dome ceiling projection and upward viewing perspective${isCOSMOS ? " with infinite COSMOS mathematical beauty and cosmic spiral formations" : ""}.`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "16K",
  format = "equirectangular",
  perspective?: string,
): string {
  const perspectiveText = perspective ? `, ${perspective} perspective` : ""

  return `IMMERSIVE ${resolution} 360-DEGREE PANORAMIC ARTWORK: Transform this extraordinary artwork into a complete 360-degree panoramic composition optimized for VR and immersive displays with ${resolution} resolution.

360-DEGREE PANORAMIC SPECIFICATIONS:
- SEAMLESS WRAPAROUND COMPOSITION with absolutely no visible seams or breaks
- ${format.toUpperCase()} PROJECTION MAPPING for professional VR and 360-degree viewers
- ${resolution} ULTRA-HIGH RESOLUTION with enhanced detail density for immersive viewing
- SPHERICAL PANORAMIC FORMAT suitable for VR headsets and 360-degree display systems
- IMMERSIVE ENVIRONMENTAL MAPPING with full spherical coverage
- PANORAMIC DISTORTION CORRECTION for proper ${format} format rendering
- VR-READY COMPOSITION with optimal aspect ratio for virtual reality systems
- 360-DEGREE ENVIRONMENTAL STORYTELLING with strategic element placement
- IMMERSIVE WRAPAROUND VISUAL EXPERIENCE surrounding viewers completely
- PROFESSIONAL VR COMPATIBILITY with industry-standard 360-degree formats
- OPTIMAL HORIZONTAL FLOW specifically designed for 360-degree viewing
- STRATEGIC PATTERN DISTRIBUTION across complete 360-degree viewing sphere
- PERFECT HORIZON PLACEMENT optimized for VR and 360-degree environments
- FLAWLESS SMOOTH TRANSITIONS at wraparound edges with computational precision
- NATURAL COMPOSITION FLOW working beautifully around full circular view

PANORAMIC ARTISTIC VISION FOR 360-DEGREE EXPERIENCE:
${basePrompt}

360-DEGREE TRANSFORMATION SPECIFICATIONS:
Transform this magnificent concept specifically for 360-degree panoramic viewing, ensuring the composition flows naturally and beautifully around the full circular view, creating an absolutely immersive experience when viewed in VR or 360-degree environments. Every element should be positioned with precision to create a seamless, breathtaking panoramic experience that surrounds viewers in artistic beauty${perspectiveText}.

ADVANCED PANORAMIC FEATURES:
- Enhanced detail density optimized for immersive viewing experiences
- Professional VR compatibility with industry-standard formats
- Seamless horizontal wrapping with no visible seams
- Strategic composition flow for complete 360-degree immersion
- Optimal viewing experience across all angles and perspectives

FINAL 360-DEGREE VISION: Create a breathtaking panoramic artwork that completely surrounds viewers in an immersive 360-degree experience, with seamless wraparound composition, ${resolution} resolution detail, and perfect ${format} format optimization - all designed for professional VR and panoramic display systems.`
}
