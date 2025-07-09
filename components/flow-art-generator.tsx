"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Download, Zap, Info, Sparkles } from "lucide-react"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ClientUpscaler } from "@/lib/client-upscaler"

interface UpscaleMetadata {
  originalSize: string
  upscaledSize: string
  scaleFactor: number
  model: string
  quality: string
  method: string
}

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState<string>("spirals")
  const [seed, setSeed] = useState<number>(1234)
  const [colorScheme, setColorScheme] = useState<string>("magma")
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("svg")
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null)
  const [upscaledImageUrl, setUpscaledImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [upscaling, setUpscaling] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [noise, setNoise] = useState<number>(0.05)
  const [numSamples, setNumSamples] = useState<number>(1000)
  const [upscaleProgress, setUpscaleProgress] = useState<number>(0)
  const [upscaleStatus, setUpscaleStatus] = useState<string>("")
  const [upscaleMetadata, setUpscaleMetadata] = useState<UpscaleMetadata | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setBaseImageUrl(null)
    setUpscaledImageUrl(null)
    setUpscaleMetadata(null)

    try {
      let response
      if (generationMode === "svg") {
        response = await fetch("/api/generate-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataset, seed, colorScheme, numSamples, noise }),
        })
      } else {
        response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ dataset, seed, colorScheme, numSamples, noise }),
        })
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      setBaseImageUrl(data.image)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDirectBicubicUpscale = async () => {
    if (!baseImageUrl) return

    setUpscaling(true)
    setUpscaleProgress(0)
    setUpscaleStatus("Using direct client-side bicubic upscaling...")
    setError(null)

    try {
      setUpscaleProgress(25)
      setUpscaleStatus("Applying direct bicubic interpolation...")

      // Direct bicubic upscaling - no fallbacks, no server calls
      const upscaledImage = await ClientUpscaler.upscaleImage(baseImageUrl, 4)

      setUpscaleProgress(75)
      setUpscaleStatus("Enhancing with direct bicubic filters...")

      const enhancedImage = await ClientUpscaler.enhanceImage(upscaledImage)

      setUpscaledImageUrl(enhancedImage)
      setUpscaleMetadata({
        originalSize: "1792x1024",
        upscaledSize: "7168x4096",
        scaleFactor: 4,
        model: "Direct Client-side Bicubic",
        quality: "High Quality Direct Bicubic",
        method: "direct-bicubic-only",
      })

      setUpscaleProgress(100)
      setUpscaleStatus("Direct bicubic upscaling complete!")
    } catch (err: any) {
      setError("Direct bicubic upscaling failed: " + err.message)
    } finally {
      setUpscaling(false)
    }
  }

  const handleDownload = (isUpscaled = false) => {
    const downloadUrl = isUpscaled ? upscaledImageUrl : baseImageUrl
    if (downloadUrl) {
      const link = document.createElement("a")
      link.href = downloadUrl
      const fileExtension = generationMode === "svg" ? "svg" : "png"
      const suffix = isUpscaled ? "-direct-bicubic-4x" : "-base"
      link.download = `flowsketch-art${suffix}-${Date.now()}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const currentImage = upscaledImageUrl || baseImageUrl

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">FlowSketch Art Generator</CardTitle>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Create structured art using toy datasets. Direct client-side bicubic upscaling only.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spirals">Spirals</SelectItem>
                  <SelectItem value="checkerboard">Checkerboard</SelectItem>
                  <SelectItem value="moons">Moons</SelectItem>
                  <SelectItem value="gaussian">Gaussian</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                placeholder="Enter a seed"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="num-samples">Number of Samples</Label>
              <Input
                id="num-samples"
                type="number"
                value={numSamples}
                onChange={(e) => setNumSamples(Number(e.target.value))}
                placeholder="Enter number of samples"
                min={100}
                step={100}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="noise">Noise Level</Label>
              <Input
                id="noise"
                type="number"
                value={noise}
                onChange={(e) => setNoise(Number(e.target.value))}
                placeholder="Enter noise level"
                step={0.01}
                min={0}
                max={1}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="color-scheme">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={setColorScheme}>
              <SelectTrigger id="color-scheme">
                <SelectValue placeholder="Select a color scheme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="magma">Magma</SelectItem>
                <SelectItem value="viridis">Viridis</SelectItem>
                <SelectItem value="plasma">Plasma</SelectItem>
                <SelectItem value="cividis">Cividis</SelectItem>
                <SelectItem value="grayscale">Grayscale</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Generation Mode</Label>
            <RadioGroup
              value={generationMode}
              onValueChange={(value: "svg" | "ai") => setGenerationMode(value)}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="svg" id="mode-svg" />
                <Label htmlFor="mode-svg">SVG Plot</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="ai" id="mode-ai" />
                <Label htmlFor="mode-ai">AI Generated</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={loading || upscaling}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Base Image...
              </>
            ) : (
              "Generate Flow Art"
            )}
          </Button>

          {error && <p className="text-red-500 text-center">{error}</p>}

          {currentImage && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="relative">
                <img
                  src={currentImage || "/placeholder.svg"}
                  alt="Generated Flow Art"
                  className="max-w-full h-auto border rounded-lg shadow-md"
                />
                <div className="absolute top-2 right-2 flex gap-2">
                  {upscaledImageUrl ? (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Direct Bicubic 4x
                    </Badge>
                  ) : (
                    <Badge className="bg-blue-500">Base Resolution</Badge>
                  )}
                </div>
              </div>

              {upscaling && (
                <div className="w-full max-w-md space-y-2">
                  <Progress value={upscaleProgress} className="w-full" />
                  <p className="text-sm text-center text-gray-600">{upscaleStatus}</p>
                </div>
              )}

              {upscaleMetadata && (
                <Alert className="max-w-md">
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-1 text-sm">
                      <div>
                        <strong>Resolution:</strong> {upscaleMetadata.upscaledSize}
                      </div>
                      <div>
                        <strong>Method:</strong> {upscaleMetadata.model}
                      </div>
                      <div>
                        <strong>Quality:</strong> {upscaleMetadata.quality}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex flex-col sm:flex-row gap-2 w-full max-w-md">
                <Button onClick={() => handleDownload(false)} variant="outline" className="flex-1">
                  <Download className="mr-2 h-4 w-4" />
                  Download Base
                </Button>

                {!upscaledImageUrl && baseImageUrl && (
                  <Button
                    onClick={handleDirectBicubicUpscale}
                    disabled={upscaling}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                  >
                    {upscaling ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Zap className="mr-2 h-4 w-4" />}
                    Direct Bicubic 4x
                  </Button>
                )}

                {upscaledImageUrl && (
                  <Button
                    onClick={() => handleDownload(true)}
                    className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download Direct 4x
                  </Button>
                )}
              </div>

              {!upscaledImageUrl && baseImageUrl && (
                <p className="text-xs text-gray-500 text-center max-w-md">
                  Using direct client-side bicubic upscaling - no server dependencies
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
