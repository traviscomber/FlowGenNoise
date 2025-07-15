"use client"

import { useState, useCallback } from "react"
import { Settings, Download, Sparkles, Wand2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface EnhanceSettings {
  scale: number
  enhanceMode: "photo" | "artwork" | "anime" | "generic"
  denoiseStrength: number
  sharpenStrength: number
}

interface ImageEnhancementSuiteProps {
  baseImageUrl: string
  onEnhancedImage: (imageUrl: string, metadata: any) => void
}

export function ImageEnhancementSuite({ baseImageUrl, onEnhancedImage }: ImageEnhancementSuiteProps) {
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [settings, setSettings] = useState<EnhanceSettings>({
    scale: 2,
    enhanceMode: "generic",
    denoiseStrength: 0.5,
    sharpenStrength: 0.3,
  })

  const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(",")
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png"
    const bstr = atob(arr[1])
    let n = bstr.length
    const u8arr = new Uint8Array(n)
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], filename, { type: mime })
  }

  const handleEnhance = useCallback(async () => {
    if (!baseImageUrl) return

    setIsProcessing(true)
    setProgress(0)

    try {
      const formData = new FormData()
      const imageFile = dataURLtoFile(baseImageUrl, "image.png")

      formData.append("image", imageFile)
      formData.append("scale", settings.scale.toString())
      formData.append("enhanceMode", settings.enhanceMode)
      formData.append("denoiseStrength", settings.denoiseStrength.toString())
      formData.append("sharpenStrength", settings.sharpenStrength.toString())

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 10, 90))
      }, 200)

      const response = await fetch("/api/enhance-image", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setProgress(100)

      if (!response.ok) {
        throw new Error("Failed to enhance image")
      }

      const blob = await response.blob()
      const enhancedUrl = URL.createObjectURL(blob)
      setEnhancedImage(enhancedUrl)

      const metadata = {
        scale: settings.scale,
        enhanceMode: settings.enhanceMode,
        denoiseStrength: settings.denoiseStrength,
        sharpenStrength: settings.sharpenStrength,
        originalSize: "Base Resolution",
        enhancedSize: `${settings.scale}x Enhanced`,
        method: "AI Enhancement Suite",
      }

      onEnhancedImage(enhancedUrl, metadata)
    } catch (error) {
      console.error("Enhancement failed:", error)
    } finally {
      setIsProcessing(false)
      setProgress(0)
    }
  }, [baseImageUrl, settings, onEnhancedImage])

  const handleDownload = useCallback(() => {
    if (!enhancedImage) return

    const link = document.createElement("a")
    link.href = enhancedImage
    link.download = `enhanced_${settings.scale}x.jpg`
    link.click()
  }, [enhancedImage, settings.scale])

  return (
    <Card className="w-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border-purple-500/30">
      <CardHeader>
        <CardTitle className="text-center text-xl flex items-center justify-center gap-2">
          <Wand2 className="text-purple-400" />
          AI Enhancement Suite
        </CardTitle>
        <p className="text-center text-sm text-gray-400">
          Enhance your generated art with AI-powered upscaling and filters
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Enhancement Mode Selection */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Enhancement Mode</Label>
            <Select
              value={settings.enhanceMode}
              onValueChange={(value: "photo" | "artwork" | "anime" | "generic") =>
                setSettings((prev) => ({ ...prev, enhanceMode: value }))
              }
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="generic">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Generic</Badge>
                    <span>All-purpose</span>
                  </div>
                </SelectItem>
                <SelectItem value="artwork">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500">Artwork</Badge>
                    <span>Digital art</span>
                  </div>
                </SelectItem>
                <SelectItem value="photo">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Photo</Badge>
                    <span>Realistic images</span>
                  </div>
                </SelectItem>
                <SelectItem value="anime">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-500">Anime</Badge>
                    <span>Anime/cartoon</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upscale Factor: {settings.scale}x</Label>
            <Slider
              value={[settings.scale]}
              onValueChange={([value]) => setSettings((prev) => ({ ...prev, scale: value }))}
              min={1}
              max={4}
              step={0.5}
              className="w-full"
            />
          </div>
        </div>

        {/* Advanced Settings */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </span>
              <span className="text-xs">{showAdvanced ? "Hide" : "Show"}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Denoise Strength: {settings.denoiseStrength.toFixed(1)}</Label>
              <Slider
                value={[settings.denoiseStrength]}
                onValueChange={([value]) => setSettings((prev) => ({ ...prev, denoiseStrength: value }))}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Sharpen Strength: {settings.sharpenStrength.toFixed(1)}</Label>
              <Slider
                value={[settings.sharpenStrength]}
                onValueChange={([value]) => setSettings((prev) => ({ ...prev, sharpenStrength: value }))}
                min={0}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Process Button */}
        <Button
          onClick={handleEnhance}
          disabled={isProcessing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {isProcessing ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Enhancing... {progress}%
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance Image
            </>
          )}
        </Button>

        {/* Progress Bar */}
        {isProcessing && <Progress value={progress} className="w-full" />}

        {/* Enhanced Image Preview */}
        {enhancedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img src={enhancedImage || "/placeholder.svg"} alt="Enhanced" className="w-full rounded-lg shadow-lg" />
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="w-3 h-3 mr-1" />
                {settings.scale}x Enhanced
              </Badge>
            </div>

            <Button
              onClick={handleDownload}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced ({settings.scale}x)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
