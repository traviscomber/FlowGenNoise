import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  console.log("🔍 API Key validation endpoint called")

  try {
    // Only check server-side environment variable (no NEXT_PUBLIC_)
    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      console.error("❌ No OpenAI API key found in server environment")
      return NextResponse.json({
        valid: false,
        error: "OpenAI API key not configured in server environment variables",
        details: "Please set OPENAI_API_KEY in your .env.local file",
      })
    }

    // Validate key format
    if (!apiKey.startsWith("sk-")) {
      console.error("❌ Invalid API key format")
      return NextResponse.json({
        valid: false,
        error: "Invalid API key format",
        details: "OpenAI API keys should start with 'sk-'",
      })
    }

    // Check key length
    if (apiKey.length < 40) {
      console.error("❌ API key too short")
      return NextResponse.json({
        valid: false,
        error: "API key appears to be too short",
        details: "OpenAI API keys are typically 51+ characters long",
      })
    }

    console.log(`🔑 Testing API key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`)

    // Test the API key with a simple request
    const testResponse = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    })

    if (!testResponse.ok) {
      const errorData = await testResponse.json().catch(() => ({}))
      console.error(`❌ API key test failed: ${testResponse.status}`, errorData)

      return NextResponse.json({
        valid: false,
        error: `API key validation failed: ${testResponse.status} ${testResponse.statusText}`,
        details: errorData.error?.message || "Unable to authenticate with OpenAI API",
      })
    }

    const modelsData = await testResponse.json()
    console.log("✅ API key validation successful")

    // Check if DALL-E 3 is available
    const dalleModel = modelsData.data?.find((model: any) => model.id === "dall-e-3")
    const hasDALLE3 = !!dalleModel

    return NextResponse.json({
      valid: true,
      message: "OpenAI API key is valid and working",
      model: "dall-e-3",
      hasDALLE3,
      keyFormat: `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`,
      keyLength: apiKey.length,
      modelsAvailable: modelsData.data?.length || 0,
    })
  } catch (error: any) {
    console.error("❌ API key validation error:", error)

    return NextResponse.json({
      valid: false,
      error: "Failed to validate API key",
      details: error.message || "Unknown error occurred during validation",
    })
  }
}
