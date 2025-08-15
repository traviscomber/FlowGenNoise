import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Validating OpenAI API Key...")

    const apiKey = process.env.OPENAI_API_KEY

    // Check if API key exists
    if (!apiKey) {
      console.error("❌ No OpenAI API key found")
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not found in environment variables",
        message: "Please add OPENAI_API_KEY to your environment variables",
        details: {
          keyFound: false,
          suggestion: "Add OPENAI_API_KEY=sk-... to your .env.local file",
        },
      })
    }

    // Check API key format
    if (!apiKey.startsWith("sk-")) {
      console.error("❌ Invalid API key format")
      return NextResponse.json({
        success: false,
        error: "Invalid OpenAI API key format",
        message: "API key must start with 'sk-'",
        details: {
          keyFound: true,
          validFormat: false,
          keyPrefix: apiKey.substring(0, 5) + "...",
        },
      })
    }

    // Check API key length
    if (apiKey.length < 20) {
      console.error("❌ API key too short")
      return NextResponse.json({
        success: false,
        error: "OpenAI API key appears to be too short",
        message: "Please verify you have the complete API key",
        details: {
          keyFound: true,
          validFormat: true,
          keyLength: apiKey.length,
        },
      })
    }

    console.log("🔑 API key format validation passed")
    console.log("🌐 Testing API connection...")

    // Test actual API connection
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("❌ OpenAI API Error:", response.status, errorText)

      if (response.status === 401) {
        return NextResponse.json({
          success: false,
          error: "Invalid OpenAI API key - authentication failed",
          message: "The API key is not valid or has been revoked",
          details: {
            keyFound: true,
            validFormat: true,
            keyLength: apiKey.length,
            apiAccessible: false,
            httpStatus: response.status,
          },
        })
      }

      return NextResponse.json({
        success: false,
        error: `OpenAI API error: ${response.status}`,
        message: errorText || "API request failed",
        details: {
          keyFound: true,
          validFormat: true,
          keyLength: apiKey.length,
          apiAccessible: false,
          httpStatus: response.status,
        },
      })
    }

    const data = await response.json()
    const modelsCount = data.data?.length || 0
    const hasDALLE = data.data?.some((model: any) => model.id.includes("dall-e")) || false

    console.log("✅ OpenAI API validation successful")
    console.log(`📊 Available models: ${modelsCount}`)
    console.log(`🎨 DALL-E available: ${hasDALLE}`)

    return NextResponse.json({
      success: true,
      message: "OpenAI API key is valid and working correctly",
      details: {
        keyFound: true,
        validFormat: true,
        keyLength: apiKey.length,
        keyPrefix: apiKey.substring(0, 7) + "...",
        apiAccessible: true,
        modelsAvailable: modelsCount,
        dalleAvailable: hasDALLE,
        timestamp: new Date().toISOString(),
      },
    })
  } catch (error: any) {
    console.error("❌ API key validation error:", error)

    if (error.name === "AbortError") {
      return NextResponse.json({
        success: false,
        error: "Request timed out",
        message: "Could not connect to OpenAI API within 10 seconds",
        details: {
          timeout: true,
        },
      })
    }

    return NextResponse.json({
      success: false,
      error: `Validation failed: ${error.message}`,
      message: "Could not validate API key due to network or server error",
      details: {
        networkError: true,
        originalError: error.message,
      },
    })
  }
}
