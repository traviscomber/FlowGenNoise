"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Download } from "lucide-react"
import { ImageIcon } from "lucide-react"
import { Save } from "lucide-react"
import { SaveArtworkDialog } from "@/components/gallery/save-artwork-dialog"

type Mode = "flow" | "ai"

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState("ffhq")
  const [scenario, setScenario] = useState("random")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 1000))
  const [numSamples, setNumSamples] = useState(1)
  const [noiseScale, setNoiseScale] = useState(0.8)
  const [timeStep, setTimeStep] = useState(0.8)
  const [customPrompt, setCustomPrompt] = useState("")
  const [mode, setMode] = useState<Mode>("flow")
  const [upscaleMethod, setUpscaleMethod] = useState("real-esrgan")

  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ imageUrl: string; svgContent: string; upscaledImageUrl?: string } | null>(null)

  const generateArtwork = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          dataset,
          scenario,
          seed,
          numSamples,
          noiseScale,
          timeStep,
          customPrompt: mode === "ai" ? customPrompt : undefined,
          upscaleMethod,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error("Failed to generate artwork:", error)
      alert("Failed to generate artwork. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const downloadImage = () => {
    if (!result?.imageUrl) return

    const link = document.createElement("a")
    link.href = result.imageUrl
    link.download = `flow-art-${seed}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">FlowSketch Art Generator</h1>
          <p className="text-muted-foreground">Generate beautiful artwork using flow-based models and AI</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/gallery">
            <ImageIcon className="mr-2 h-4 w-4" />
            View Gallery
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>Adjust the settings to generate your unique artwork.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="mode">Mode</Label>
                <Select value={mode} onValueChange={(value) => setMode(value as Mode)}>
                  <SelectTrigger id="mode">
                    <SelectValue placeholder="Select Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="ai">AI (Experimental)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {mode === "ai" && (
                <div className="grid gap-2">
                  <Label htmlFor="custom-prompt">Custom Prompt</Label>
                  <Input
                    id="custom-prompt"
                    type="text"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="A scenic landscape with vibrant colors"
                  />
                </div>
              )}
              <div className="grid gap-2">
                <Label htmlFor="dataset">Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="Select Dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ffhq">Faces (FFHQ)</SelectItem>
                    <SelectItem value="bedroom">Bedrooms</SelectItem>
                    <SelectItem value="church_outdoor">Churches</SelectItem>
                    <SelectItem value="celebahq">CelebA-HQ</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger id="scenario">
                    <SelectValue placeholder="Select Scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="random">Random</SelectItem>
                    <SelectItem value="stylegan2">StyleGAN2</SelectItem>
                    <SelectItem value="stylegan">StyleGAN</SelectItem>
                    <SelectItem value="pggan">PGGAN</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="seed">Seed</Label>
                <Input
                  id="seed"
                  type="number"
                  value={seed}
                  onChange={(e) => setSeed(Number.parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="num-samples">Number of Samples</Label>
                <Input
                  id="num-samples"
                  type="number"
                  value={numSamples}
                  onChange={(e) => setNumSamples(Number.parseInt(e.target.value))}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="noise-scale">Noise Scale</Label>
                <Slider
                  id="noise-scale"
                  defaultValue={[noiseScale * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setNoiseScale(value[0] / 100)}
                />
                <p className="text-sm text-muted-foreground">Current: {noiseScale.toFixed(2)}</p>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="time-step">Time Step</Label>
                <Slider
                  id="time-step"
                  defaultValue={[timeStep * 100]}
                  max={100}
                  step={1}
                  onValueChange={(value) => setTimeStep(value[0] / 100)}
                />
                <p className="text-sm text-muted-foreground">Current: {timeStep.toFixed(2)}</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={generateArtwork} disabled={isLoading}>
                {isLoading ? "Generating..." : "Generate Artwork"}
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div>
          {result ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Result</h2>
              <img
                src={result.imageUrl || "/placeholder.svg"}
                alt="Generated Artwork"
                className="rounded-md shadow-md"
              />
              <div className="flex space-x-2">
                <Button variant="outline" onClick={downloadImage} className="flex-1 bg-transparent">
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
                <SaveArtworkDialog
                  imageUrl={result.imageUrl}
                  svgContent={result.svgContent}
                  upscaledImageUrl={result.upscaledImageUrl}
                  mode={mode}
                  generationParams={{
                    dataset,
                    scenario,
                    seed,
                    numSamples,
                    noiseScale,
                    timeStep,
                    customPrompt: mode === "ai" ? customPrompt : undefined,
                    upscaleMethod: result.upscaledImageUrl ? upscaleMethod : undefined,
                  }}
                >
                  <Button variant="outline" className="flex-1 bg-transparent">
                    <Save className="mr-2 h-4 w-4" />
                    Save to Gallery
                  </Button>
                </SaveArtworkDialog>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                No artwork generated yet. Adjust the settings and click "Generate Artwork".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
