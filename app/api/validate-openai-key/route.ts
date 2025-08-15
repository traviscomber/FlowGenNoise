import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 Validating OpenAI API key...")

    // Check if API key exists
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) {
      console.log("❌ No OpenAI API key found in environment variables")
      return NextResponse.json({
        success: false,
        error: "OpenAI API key not configured",
        message: "Please set OPENAI_API_KEY in your environment variables",
        details: {
          keyExists: false,
          keyLength: 0,
          keyFormat: "N/A",
        },
      })
    }

    // Basic format validation
    const keyLength = apiKey.length
    const keyFormat = apiKey.startsWith("sk-") ? "Valid format" : "Invalid format (should start with 'sk-')"
    const keyPreview = `${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`

    console.log(`🔑 API key found: ${keyPreview} (${keyLength} chars)`)

    // Test API key with a simple request
    try {
      console.log("🧪 Testing API key with OpenAI API...")

      const response = await fetch("https://api.openai.com/v1/models", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        const hasDALLE3 = data.data?.some((model: any) => model.id === "dall-e-3")

        console.log("✅ API key validation successful")
        console.log(`🎨 DALL-E 3 available: ${hasDALLE3 ? "YES" : "NO"}`)

        return NextResponse.json({
          success: true,
          message: "OpenAI API key is valid and working!",
          details: {
            keyExists: true,
            keyLength,
            keyFormat,
            keyPreview,
            apiAccess: true,
            dalleAccess: hasDALLE3,
            modelsCount: data.data?.length || 0,
          },
        })
      } else {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`

        console.log(`❌ API key validation failed: ${errorMessage}`)

        return NextResponse.json({
          success: false,
          error: "API key validation failed",
          message: `OpenAI API rejected the key: ${errorMessage}`,
          details: {
            keyExists: true,
            keyLength,
            keyFormat,
            keyPreview,
            apiAccess: false,
            httpStatus: response.status,
            errorMessage,
          },
        })
      }
    } catch (apiError: any) {
      console.log(`❌ API request failed: ${apiError.message}`)

      return NextResponse.json({
        success: false,
        error: "API request failed",
        message: `Failed to connect to OpenAI API: ${apiError.message}`,
        details: {
          keyExists: true,
          keyLength,
          keyFormat,
          keyPreview,
          apiAccess: false,
          connectionError: apiError.message,
        },
      })
    }
  } catch (error: any) {
    console.error("❌ Validation error:", error)

    return NextResponse.json({
      success: false,
      error: "Validation failed",
      message: `Unexpected error during validation: ${error.message}`,
      details: {
        keyExists: false,
        validationError: error.message,
      },
    })
  }
}
