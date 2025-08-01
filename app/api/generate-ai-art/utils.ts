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
      "circular fisheye projection with 180-degree field of view, curved perspective distortion for dome ceiling projection",
    equidistant: "equidistant projection maintaining equal angular spacing, optimized for planetarium dome display",
    stereographic: "stereographic projection with conformal mapping, preserving angles for immersive dome experience",
  }

  const projectionDescription = domeSpecs[projectionType as keyof typeof domeSpecs] || domeSpecs.fisheye

  return `${basePrompt}, specifically designed for ${diameter}meter planetarium dome projection, ${projectionDescription}, ${resolution} resolution optimized for dome display, immersive overhead viewing experience, curved architectural space, celestial dome mapping, spherical coordinate system, zenith-focused composition, radial symmetry from center point, optimized for upward viewing angle, planetarium-quality visual experience`
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
