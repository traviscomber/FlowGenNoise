"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { RotateCcw, Download, Palette, Sun, Focus, Shield, Thermometer, Circle } from "lucide-react"
import { ImageEnhancementSuite } from "@/lib/enhancement-suite"

interface ImageEnhancementPanelProps {
  originalImage: string
  onEnhancedImageChange: (enhancedImage: string) => void
}

export function ImageEnhancementPanel({ originalImage, onEnhancedImageChange }: ImageEnhancementPanelProps) {
  const [enhancementSuite, setEnhancementSuite] = useState<ImageEnhancementSuite | null>(null)
  const [currentImage, setCurrentImage] = useState<string>(originalImage)
  const [loading, setLoading] = useState(true)

  // Enhancement values
  const [brightness, setBrightness] = useState([0])
  const [contrast, setContrast] = useState([0])
  const [saturation, setSaturation] = useState([100])
  const [sharpness, setSharpness] = useState([0])
  const [blur, setBlur] = useState([0])
  const [temperature, setTemperature] = useState([0])
  const [vignette, setVignette] = useState([0])

  // Initialize enhancement suite
  useEffect(() => {
    const initSuite = async () => {
      try {
        const suite = new ImageEnhancementSuite()
        await suite.loadImage(originalImage)
        setEnhancementSuite(suite)
        setLoading(false)
      } catch (error) {
        console.error("Failed to initialize enhancement suite:", error)
        setLoading(false)
      }
    }

    initSuite()
  }, [originalImage])

  // Apply enhancement and update image
  const applyEnhancement = async (type: string, value: number | number[]) => {
    if (!enhancementSuite) return

    try {
      let enhancedImage: string

      switch (type) {
        case "brightness":
          enhancedImage = enhancementSuite.adjustBrightness(Array.isArray(value) ? value[0] : value)
          break
        case "contrast":
          enhancedImage = enhancementSuite.adjustContrast(Array.isArray(value) ? value[0] : value)
          break
        case "saturation":
          enhancedImage = enhancementSuite.adjustSaturation(Array.isArray(value) ? value[0] : value)
          break
        case "sharpness":
          enhancedImage = enhancementSuite.applySharpen((Array.isArray(value) ? value[0] : value) / 100)
          break
        case "blur":
          enhancedImage = enhancementSuite.applyBlur(Array.isArray(value) ? value[0] : value)
          break
        case "temperature":
          enhancedImage = enhancementSuite.adjustColorTemperature(Array.isArray(value) ? value[0] : value)
          break
        case "vignette":
          enhancedImage = enhancementSuite.applyVignette((Array.isArray(value) ? value[0] : value) / 100)
          break
        case "noise-reduction":
          enhancedImage = enhancementSuite.applyNoiseReduction()
          break
        default:
          return
      }

      setCurrentImage(enhancedImage)
      onEnhancedImageChange(enhancedImage)
    } catch (error) {
      console.error("Enhancement failed:", error)
    }
  }

  // Reset all enhancements
  const resetEnhancements = () => {
    if (!enhancementSuite) return

    setBrightness([0])
    setContrast([0])
    setSaturation([100])
    setSharpness([0])
    setBlur([0])
    setTemperature([0])
    setVignette([0])

    const resetImage = enhancementSuite.reset()
    setCurrentImage(resetImage)
    onEnhancedImageChange(resetImage)
  }

  // Apply noise reduction
  const applyNoiseReduction = () => {
    applyEnhancement("noise-reduction", 0)
  }

  // Download enhanced image
  const downloadEnhanced = () => {
    const link = document.createElement("a")
    link.href = currentImage
    link.download = `flowsketch-enhanced-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Enhancement Suite
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Enhancement Suite
            <Badge variant="secondary">Professional</Badge>
          </CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={resetEnhancements}>
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button size="sm" onClick={downloadEnhanced}>
              <Download className="h-4 w-4 mr-1" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Adjustments */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Sun className="h-4 w-4" />
            Basic Adjustments
          </h3>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Brightness: {brightness[0]}</Label>
              <Slider
                value={brightness}
                onValueChange={(value) => {
                  setBrightness(value)
                  applyEnhancement("brightness", value)
                }}
                min={-100}
                max={100}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Contrast: {contrast[0]}</Label>
              <Slider
                value={contrast}
                onValueChange={(value) => {
                  setContrast(value)
                  applyEnhancement("contrast", value)
                }}
                min={-100}
                max={100}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Saturation: {saturation[0]}%</Label>
              <Slider
                value={saturation}
                onValueChange={(value) => {
                  setSaturation(value)
                  applyEnhancement("saturation", value)
                }}
                min={0}
                max={200}
                step={1}
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Color Adjustments */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Color Temperature
          </h3>

          <div>
            <Label className="text-xs">
              Temperature: {temperature[0] > 0 ? "Warm" : temperature[0] < 0 ? "Cool" : "Neutral"} ({temperature[0]})
            </Label>
            <Slider
              value={temperature}
              onValueChange={(value) => {
                setTemperature(value)
                applyEnhancement("temperature", value)
              }}
              min={-100}
              max={100}
              step={1}
              className="mt-1"
            />
          </div>
        </div>

        <Separator />

        {/* Detail Enhancement */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Focus className="h-4 w-4" />
            Detail Enhancement
          </h3>

          <div className="space-y-3">
            <div>
              <Label className="text-xs">Sharpness: {sharpness[0]}%</Label>
              <Slider
                value={sharpness}
                onValueChange={(value) => {
                  setSharpness(value)
                  applyEnhancement("sharpness", value)
                }}
                min={0}
                max={200}
                step={1}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-xs">Blur: {blur[0]}px</Label>
              <Slider
                value={blur}
                onValueChange={(value) => {
                  setBlur(value)
                  applyEnhancement("blur", value)
                }}
                min={0}
                max={10}
                step={0.1}
                className="mt-1"
              />
            </div>

            <Button variant="outline" size="sm" onClick={applyNoiseReduction} className="w-full bg-transparent">
              <Shield className="h-4 w-4 mr-2" />
              Apply Noise Reduction
            </Button>
          </div>
        </div>

        <Separator />

        {/* Effects */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium flex items-center gap-2">
            <Circle className="h-4 w-4" />
            Effects
          </h3>

          <div>
            <Label className="text-xs">Vignette: {vignette[0]}%</Label>
            <Slider
              value={vignette}
              onValueChange={(value) => {
                setVignette(value)
                applyEnhancement("vignette", value)
              }}
              min={0}
              max={100}
              step={1}
              className="mt-1"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
