// OpenAI API utility functions for FlowSketch Art Generator

export async function callOpenAI(prompt: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    throw new Error("OpenAI API key not configured")
  }

  try {
    const response = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "dall-e-3",
        prompt: prompt.substring(0, 4000), // DALL-E 3 has a 4000 character limit
        n: 1,
        size: "1024x1024",
        quality: "hd",
        style: "vivid",
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(`OpenAI API error: ${response.status} - ${errorData.error?.message || "Unknown error"}`)
    }

    const data = await response.json()

    if (!data.data || !data.data[0] || !data.data[0].url) {
      throw new Error("Invalid response from OpenAI API")
    }

    return data.data[0].url
  } catch (error: any) {
    console.error("OpenAI API call failed:", error)
    throw new Error(`Failed to generate image: ${error.message}`)
  }
}

export function generateDomePrompt(
  basePrompt: string,
  diameter = 20,
  resolution = "4K",
  projectionType = "fisheye",
): string {
  const domeSpecs = {
    fisheye:
      "TUNNEL UP EFFECT: circular fisheye projection with dramatic tunnel perspective shooting upward toward dome ceiling, 180-degree field of view with extreme curved perspective distortion creating immersive tunnel effect, content appears to tunnel upward from center point radiating outward to dome edges, optimized for overhead planetarium viewing with viewers looking up at dome ceiling, dramatic depth illusion with content appearing to extend infinitely upward into dome space",
    equidistant:
      "TUNNEL UP EFFECT: equidistant projection maintaining equal angular spacing while creating upward tunnel illusion, content flows from center point upward and outward to dome perimeter, optimized for planetarium dome display with dramatic vertical depth, viewers experience content tunneling up toward zenith point of dome ceiling",
    stereographic:
      "TUNNEL UP EFFECT: stereographic projection with conformal mapping creating dramatic upward tunnel perspective, preserving angles while creating immersive dome experience with content appearing to tunnel up from center toward dome ceiling, little planet effect inverted for upward dome viewing, dramatic perspective distortion for overhead planetarium experience",
  }

  const projectionDescription = domeSpecs[projectionType as keyof typeof domeSpecs] || domeSpecs.fisheye

  return `${basePrompt}, PLANETARIUM DOME TUNNEL UP PROJECTION: specifically designed for ${diameter}meter planetarium dome with dramatic TUNNEL UP EFFECT, ${projectionDescription}, ${resolution} resolution optimized for dome display, immersive overhead viewing experience with content tunneling upward toward dome ceiling, curved architectural space projection, celestial dome mapping with upward perspective, spherical coordinate system with zenith-focused composition, radial symmetry from center point expanding upward and outward, optimized for upward viewing angle with viewers looking up at dome ceiling, planetarium-quality visual experience with dramatic tunnel depth illusion, content appears to extend infinitely upward into dome space creating immersive tunnel effect, fisheye distortion creating dramatic upward perspective for overhead planetarium projection`
}

export function generatePanoramaPrompt(
  basePrompt: string,
  resolution = "8K",
  format = "equirectangular",
  perspective?: string,
): string {
  const formatSpecs = {
    equirectangular:
      "360-degree equirectangular panorama format, spherical projection mapping, seamless horizontal wrap-around view",
    stereographic:
      "stereographic panorama projection with conformal mapping, little planet or tunnel effect transformation",
    cylindrical: "cylindrical panorama projection, horizontal 360-degree sweep with vertical perspective maintained",
  }

  const formatDescription = formatSpecs[format as keyof typeof formatSpecs] || formatSpecs.equirectangular

  let perspectiveAddition = ""
  if (format === "stereographic" && perspective) {
    const perspectiveSpecs = {
      "little-planet":
        "little planet effect with ground at center and sky forming outer ring, miniature world perspective",
      tunnel: "tunnel effect with sky at center and ground forming outer ring, immersive portal perspective",
      "mirror-ball": "mirror ball reflection effect, convex spherical distortion, chrome ball perspective",
    }
    perspectiveAddition = `, ${perspectiveSpecs[perspective as keyof typeof perspectiveSpecs] || ""}`
  }

  return `${basePrompt}, ${formatDescription}${perspectiveAddition}, ${resolution} ultra-high resolution, immersive 360-degree experience, virtual reality compatible, seamless spherical mapping, no visible seams or distortion artifacts, optimized for VR headsets and panoramic viewers`
}
