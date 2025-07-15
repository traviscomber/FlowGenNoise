"use client"

import { useState, useCallback } from "react"
import { Settings, Download, Sparkles, Wand2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface EnhanceSettings {
  scale: number
  enhanceMode: "photo" | "artwork" | "anime" | "generic"
  denoiseStrength: number
  sharpenStrength: number
  contrastBoost: number
  saturationBoost: number
}

interface Props {
  baseImageUrl: string
  onEnhancedImage: (url: string, meta: Record<string, unknown>) => void
}

export function ImageEnhancementSuite({ baseImageUrl, onEnhancedImage }: Props) {
  const [settings, setSettings] = useState<EnhanceSettings>({
    scale: 2,
    enhanceMode: "artwork",
    denoiseStrength: 0.3,
    sharpenStrength: 0.7,
    contrastBoost: 0.2,
    saturationBoost: 0.3,
  })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [enhancementMethod, setEnhancementMethod] = useState<string>("")

  // Advanced client-side enhancement with multiple passes
  const enhanceLocally = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Create high-resolution canvas
          const originalW = img.width
          const originalH = img.height
          const scaledW = Math.floor(originalW * settings.scale)
          const scaledH = Math.floor(originalH * settings.scale)

          const canvas = document.createElement("canvas")
          canvas.width = scaledW
          canvas.height = scaledH
          const ctx = canvas.getContext("2d")

          if (!ctx) {
            reject(new Error("Canvas not supported"))
            return
          }

          // Enable high-quality scaling
          ctx.imageSmoothingEnabled = true
          ctx.imageSmoothingQuality = "high"

          // Step 1: Initial upscale with bicubic-like interpolation
          ctx.drawImage(img, 0, 0, scaledW, scaledH)

          // Step 2: Get image data for pixel-level processing
          const imageData = ctx.getImageData(0, 0, scaledW, scaledH)
          const data = imageData.data

          // Step 3: Apply enhancement based on mode
          for (let i = 0; i < data.length; i += 4) {
            let r = data[i]
            let g = data[i + 1]
            let b = data[i + 2]

            // Mode-specific enhancements
            switch (settings.enhanceMode) {
              case "photo":
                // Natural photo enhancement
                r = Math.min(255, r * (1 + settings.contrastBoost * 0.5))
                g = Math.min(255, g * (1 + settings.contrastBoost * 0.5))
                b = Math.min(255, b * (1 + settings.contrastBoost * 0.5))
                break

              case "artwork":
                // Vibrant artwork enhancement
                const artworkBoost = 1 + settings.saturationBoost
                const avg = (r + g + b) / 3
                r = Math.min(255, avg + (r - avg) * artworkBoost)
                g = Math.min(255, avg + (g - avg) * artworkBoost)
                b = Math.min(255, avg + (b - avg) * artworkBoost)
                break

              case "anime":
                // Anime-style enhancement with color pop
                r = Math.min(255, r * (1 + settings.saturationBoost * 1.2))
                g = Math.min(255, g * (1 + settings.saturationBoost * 1.2))
                b = Math.min(255, b * (1 + settings.saturationBoost * 1.2))
                break

              default:
                // Generic enhancement
                const contrast = 1 + settings.contrastBoost
                r = Math.min(255, Math.max(0, (r - 128) * contrast + 128))
                g = Math.min(255, Math.max(0, (g - 128) * contrast + 128))
                b = Math.min(255, Math.max(0, (b - 128) * contrast + 128))
            }

            data[i] = r
            data[i + 1] = g
            data[i + 2] = b
          }

          // Step 4: Apply sharpening if enabled
          if (settings.sharpenStrength > 0) {
            const sharpenedData = applySharpen(imageData, settings.sharpenStrength)
            ctx.putImageData(sharpenedData, 0, 0)
          } else {
            ctx.putImageData(imageData, 0, 0)
          }

          // Step 5: Final quality pass with CSS filters
          const tempCanvas = document.createElement("canvas")
          tempCanvas.width = scaledW
          tempCanvas.height = scaledH
          const tempCtx = tempCanvas.getContext("2d")

          if (tempCtx) {
            // Apply final filters
            const brightness = 1 + settings.contrastBoost * 0.1
            const saturation = 1 + settings.saturationBoost
            tempCtx.filter = `brightness(${brightness}) saturate(${saturation}) contrast(1.1)`
            tempCtx.drawImage(canvas, 0, 0)

            // Convert to high-quality JPEG
            tempCanvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create enhanced image"))
                  return
                }
                const url = URL.createObjectURL(blob)
                resolve(url)
              },
              "image/jpeg",
              0.95,
            )
          } else {
            // Fallback without final filters
            canvas.toBlob(
              (blob) => {
                if (!blob) {
                  reject(new Error("Failed to create enhanced image"))
                  return
                }
                const url = URL.createObjectURL(blob)
                resolve(url)
              },
              "image/jpeg",
              0.95,
            )
          }
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = baseImageUrl
    })
  }

  // Sharpening algorithm using convolution
  const applySharpen = (imageData: ImageData, strength: number): ImageData => {
    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)
    const outputData = output.data

    // Sharpening kernel
    const kernel = [0, -strength, 0, -strength, 1 + 4 * strength, -strength, 0, -strength, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          // RGB channels
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
            }
          }
          const outputIdx = (y * width + x) * 4 + c
          outputData[outputIdx] = Math.min(255, Math.max(0, sum))
        }
        // Copy alpha channel
        const alphaIdx = (y * width + x) * 4 + 3
        outputData[alphaIdx] = data[alphaIdx]
      }
    }

    return output
  }

  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [meta, data] = dataUrl.split(",")
    const mime = meta.match(/:(.*?);/)?.[1] || "image/png"
    const binary = atob(data)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
    return new File([array], filename, { type: mime })
  }

  const handleEnhance = useCallback(async () => {
    if (!baseImageUrl) return

    setProcessing(true)
    setProgress(0)
    setEnhancementMethod("")

    const progressInterval = setInterval(() => {
      setProgress((prev) => Math.min(prev + 8, 85))
    }, 200)

    try {
      // Try server-side enhancement first
      const formData = new FormData()
      formData.append("image", dataUrlToFile(baseImageUrl, "source.png"))
      formData.append("scale", settings.scale.toString())
      formData.append("enhanceMode", settings.enhanceMode)
      formData.append("denoiseStrength", settings.denoiseStrength.toString())
      formData.append("sharpenStrength", settings.sharpenStrength.toString())

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)

      try {
        const response = await fetch("/api/enhance-image", {
          method: "POST",
          body: formData,
          signal: controller.signal,
        })

        clearTimeout(timeout)

        if (response.ok) {
          const blob = await response.blob()
          const url = URL.createObjectURL(blob)
          setEnhancedUrl(url)
          setEnhancementMethod("Server-side AI Enhancement")
          onEnhancedImage(url, { ...settings, method: "server" })
        } else {
          throw new Error("Server enhancement failed")
        }
      } catch (serverError) {
        console.warn("Server enhancement failed, using client-side:", serverError)

        // Fallback to advanced client-side enhancement
        const url = await enhanceLocally()
        setEnhancedUrl(url)
        setEnhancementMethod("Advanced Client-side Enhancement")
        onEnhancedImage(url, { ...settings, method: "client-advanced" })
      }

      setProgress(100)
    } catch (error) {
      console.error("Enhancement failed:", error)
      setEnhancementMethod("Enhancement Failed")
    } finally {
      clearInterval(progressInterval)
      setTimeout(() => setProgress(0), 1000)
      setProcessing(false)
    }
  }, [baseImageUrl, settings, onEnhancedImage])

  const downloadEnhanced = () => {
    if (!enhancedUrl) return
    const a = document.createElement("a")
    a.href = enhancedUrl
    a.download = `enhanced_${settings.scale}x_${settings.enhanceMode}.jpg`
    a.click()
  }

  return (
    <Card className="w-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Wand2 className="text-purple-400" />
          AI Enhancement Suite
        </CardTitle>
        <p className="text-center text-sm text-gray-400">Professional image enhancement with advanced algorithms</p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Enhancement Mode and Scale */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Enhancement Mode</Label>
            <Select
              value={settings.enhanceMode}
              onValueChange={(v) => setSettings((s) => ({ ...s, enhanceMode: v as any }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="artwork">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-purple-500">Artwork</Badge>
                    <span>Digital Art</span>
                  </div>
                </SelectItem>
                <SelectItem value="photo">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500">Photo</Badge>
                    <span>Realistic</span>
                  </div>
                </SelectItem>
                <SelectItem value="anime">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-pink-500">Anime</Badge>
                    <span>Cartoon/Anime</span>
                  </div>
                </SelectItem>
                <SelectItem value="generic">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Generic</Badge>
                    <span>All-purpose</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upscale Factor: {settings.scale}×</Label>
            <Slider
              min={1}
              max={4}
              step={0.5}
              value={[settings.scale]}
              onValueChange={([v]) => setSettings((s) => ({ ...s, scale: v }))}
              className="w-full"
            />
          </div>
        </div>

        {/* Quick Enhancement Controls */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sharpness: {settings.sharpenStrength.toFixed(1)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[settings.sharpenStrength]}
              onValueChange={([v]) => setSettings((s) => ({ ...s, sharpenStrength: v }))}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label>Vibrancy: {settings.saturationBoost.toFixed(1)}</Label>
            <Slider
              min={0}
              max={1}
              step={0.1}
              value={[settings.saturationBoost]}
              onValueChange={([v]) => setSettings((s) => ({ ...s, saturationBoost: v }))}
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
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Contrast Boost: {settings.contrastBoost.toFixed(1)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[settings.contrastBoost]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, contrastBoost: v }))}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Noise Reduction: {settings.denoiseStrength.toFixed(1)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[settings.denoiseStrength]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, denoiseStrength: v }))}
                className="w-full"
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Enhancement Info */}
        {enhancementMethod && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Using: {enhancementMethod}</AlertDescription>
          </Alert>
        )}

        {/* Process Button */}
        <Button
          onClick={handleEnhance}
          disabled={processing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {processing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Enhancing... {progress}%
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Enhance Image
            </>
          )}
        </Button>

        {processing && <Progress value={progress} className="w-full" />}

        {/* Enhanced Result */}
        {enhancedUrl && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={enhancedUrl || "/placeholder.svg"}
                alt="Enhanced"
                className="w-full rounded-lg shadow-lg border border-purple-500/30"
              />
              <Badge className="absolute top-2 right-2 bg-gradient-to-r from-purple-500 to-pink-500">
                <Sparkles className="w-3 h-3 mr-1" />
                {settings.scale}× Enhanced
              </Badge>
            </div>

            <Button
              onClick={downloadEnhanced}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="mr-2 h-4 w-4" />
              Download Enhanced ({settings.scale}× {settings.enhanceMode})
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
