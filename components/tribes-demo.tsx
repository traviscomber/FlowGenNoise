"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { generateFlowField, type GenerationParams } from "@/lib/flow-model"
import { Sparkles, Users, MapPin, Flame } from "lucide-react"

export function TribesDemo() {
  const [tribalArt, setTribalArt] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [currentSeed, setCurrentSeed] = useState(1234)

  const generateTribalCivilization = async () => {
    setIsGenerating(true)

    // Enhanced tribal parameters
    const params: GenerationParams = {
      dataset: "tribes",
      scenario: "landscape",
      colorScheme: "sunset",
      seed: currentSeed,
      numSamples: 3000,
      noiseScale: 0.1,
      timeStep: 0.01,
      panoramic360: true,
      panoramaResolution: "1080p",
      panoramaFormat: "stereographic",
      stereographicPerspective: "little-planet",
    }

    try {
      const svgContent = generateFlowField(params)
      setTribalArt(svgContent)
    } catch (error) {
      console.error("Failed to generate tribal art:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateNewCivilization = () => {
    setCurrentSeed(Math.floor(Math.random() * 10000))
    generateTribalCivilization()
  }

  useEffect(() => {
    generateTribalCivilization()
  }, [currentSeed])

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-amber-900">
            <div className="p-2 bg-amber-200 rounded-lg">
              <Users className="h-6 w-6" />
            </div>
            Enhanced Tribes Dataset - Living Civilizations
          </CardTitle>
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="border-amber-300 text-amber-700">
              <MapPin className="h-3 w-3 mr-1" />
              Villages & Settlements
            </Badge>
            <Badge variant="outline" className="border-orange-300 text-orange-700">
              <Users className="h-3 w-3 mr-1" />
              People & Population
            </Badge>
            <Badge variant="outline" className="border-red-300 text-red-700">
              <Flame className="h-3 w-3 mr-1" />
              Rituals & Ceremonies
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-white rounded-lg p-4 border border-amber-200">
            <h3 className="font-semibold text-amber-900 mb-3">🏛️ What You'll See:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-amber-800">
              <div>
                <h4 className="font-medium mb-2">🏘️ Villages & Infrastructure:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Multiple villages per tribe (1-4 each)</li>
                  <li>• Village perimeters with communal centers</li>
                  <li>• Watchtowers along boundaries</li>
                  <li>• Trading posts on routes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">👥 People & Society:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• 50-250 people per tribe</li>
                  <li>• Individual people around dwellings</li>
                  <li>• Chiefs with guards & advisors</li>
                  <li>• Shamans with mystical patterns</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🔥 Rituals & Ceremonies:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Sacred ritual sites (2-6 per tribe)</li>
                  <li>• Stone circles for ceremonies</li>
                  <li>• Active rituals with 5-20 participants</li>
                  <li>• Sacred fire pits at centers</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">🌱 Seasonal Activities:</h4>
                <ul className="space-y-1 text-xs">
                  <li>• Spring: Planting (bright colors)</li>
                  <li>• Summer: Hunting (dark colors)</li>
                  <li>• Autumn: Harvest (warm colors)</li>
                  <li>• Winter: Crafting (muted colors)</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={generateNewCivilization}
              disabled={isGenerating}
              className="bg-amber-600 hover:bg-amber-700 text-white"
            >
              {isGenerating ? (
                <>
                  <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                  Generating Civilization...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Generate New Tribal Civilization
                </>
              )}
            </Button>
            <Badge variant="outline" className="px-3 py-1 border-amber-300 text-amber-700">
              Seed: {currentSeed}
            </Badge>
          </div>

          {tribalArt && (
            <div className="bg-slate-900 rounded-lg p-4 border border-amber-200">
              <div
                className="w-full h-96 flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: tribalArt }}
              />
            </div>
          )}

          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <h4 className="font-medium text-amber-900 mb-2">🎨 Try Different Variations:</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              <div>
                <strong>Scenarios:</strong>
                <br />
                landscape, botanical, geological, urban
              </div>
              <div>
                <strong>Colors:</strong>
                <br />
                sunset, forest, earth, tribal
              </div>
              <div>
                <strong>Samples:</strong>
                <br />
                1000-5000 for detail
              </div>
              <div>
                <strong>Noise:</strong>
                <br />
                0.05-0.2 for variation
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
