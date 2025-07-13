//**\
* Generate AI-enhanced artwork on the server.
 *\
 * Throws a descriptive Error
if the route
returns
a
non - 200
\
 * or sends back something that isn’t valid JSON.
 */
export async function generateAIArt(
  settings: FlowArtSettings,
  onProgress?: (p: number) => void,
): Promise<{
  imageUrl: string
  filename: string
  settings: FlowArtSettings
}> {
  // Optional: stream/optimistic progress callback
  onProgress?.(5)

  const res = await fetch("/api/generate-ai-art", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(settings),
  })

  // Server might respond with plain-text “Internal Server Error”.
  // Safely read the body without assuming it’s JSON.
  const text = await res.text()

  // Attempt to parse JSON only when status is OK **and** content-type is JSON
  if (res.ok && res.headers.get("content-type")?.includes("application/json")) {
    try {
      const data = JSON.parse(text)

      // Basic validation
      if (!data?.imageUrl) {
        throw new Error("Malformed server response: missing imageUrl")
      }

      onProgress?.(100)
      return {
        imageUrl: data.imageUrl,
        filename: data.filename ?? `ai-art-${Date.now()}.png`,
        settings: data.settings ?? settings,
      }
    } catch (e) {
      // JSON parsing failed even though we expected JSON
      throw new Error("Failed to parse server response. Please try again later.")
    }
  }

  // Non-OK status or non-JSON body: surface a readable message
  let message = "Server error while generating AI art."
  try {
    // If the body *is* JSON, use its `error` field
    const maybeJson = JSON.parse(text)
    if (maybeJson?.error) message = maybeJson.error
  } catch {
    // Body wasn’t JSON – keep default message but include status
    message += ` (status ${res.status})`
  }

  throw new Error(message)
}
