"use client"

import { useState } from "react"
import { ImageEnhancementSuite } from "@/components/image-enhancement-suite"

export function FlowArtGenerator() {
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [showEnhancementSuite, setShowEnhancementSuite] = useState(false)

  const handleGenerateImage = () => {
    // Simulate image generation (replace with actual logic)
    const imageUrl = "https://via.placeholder.com/400" // Replace with your image URL
    setGeneratedImage(imageUrl)
    setShowEnhancementSuite(true)
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Flow Art Generator</h1>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleGenerateImage}
      >
        Generate Image
      </button>

      {generatedImage && (
        <>
          <div className="mt-4">
            <img src={generatedImage || "/placeholder.svg"} alt="Generated Art" className="max-w-full" />
          </div>

          {/* Enhancement Suite - appears after image is generated */}
          <div className="mt-6">
            <ImageEnhancementSuite
              baseImageUrl={generatedImage}
              onEnhancedImage={(enhancedUrl, metadata) => {
                console.log("Image enhanced:", metadata)
                // Optionally update the displayed image or add to gallery
              }}
            />
          </div>
        </>
      )}
    </div>
  )
}
