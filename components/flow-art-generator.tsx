"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2, Download } from "lucide-react" // Import Download icon
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState<string>("spirals")
  const [seed, setSeed] = useState<number>(1234)
  const [colorScheme, setColorScheme] = useState<string>("magma")
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("svg")
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [noise, setNoise] = useState<number>(0.05)
  const [numSamples, setNumSamples] = useState<number>(1000)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setImageUrl(null) // Clear previous image when generating new one
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
      setImageUrl(data.image)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (imageUrl) {
      const link = document.createElement("a")
      link.href = imageUrl
      // Determine file extension based on generation mode
      const fileExtension = generationMode === "svg" ? "svg" : "png"
      link.download = `flowsketch-art-${Date.now()}.${fileExtension}`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">FlowSketch Art Generator</CardTitle>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Create structured art using toy datasets.
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
                <Label htmlFor="mode-ai">AI Generated Image</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Flow Art"
            )}
          </Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {imageUrl && (
            <div className="mt-6 flex flex-col items-center gap-4">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Generated Flow Art"
                className="max-w-full h-auto border rounded-lg shadow-md"
              />
              <Button onClick={handleDownload} className="w-full max-w-xs">
                <Download className="mr-2 h-4 w-4" />
                Download Image
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
