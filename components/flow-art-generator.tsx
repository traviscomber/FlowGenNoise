"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ModeToggle } from "@/components/mode-toggle"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { Download, Github, Heart, Loader2, Maximize2, Wand2 } from "lucide-react"
import { SaveArtworkDialog } from "./gallery/save-artwork-dialog"

export function FlowArtGenerator() {
  const [iterations, setIterations] = useState(50)
  const [brushSize, setBrushSize] = useState(5)
  const [decayRate, setDecayRate] = useState(0.01)
  const [colorPalette, setColorPalette] = useState("rainbow")
  const [useGradients, setUseGradients] = useState(true)
  const [mode, setMode] = useState<"flow" | "ai">("flow")
  const [customPrompt, setCustomPrompt] = useState("")
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [upscaledImage, setUpscaledImage] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [showSaveDialog, setShowSaveDialog] = useState(false)

  const params = {
    iterations,
    brushSize,
    decayRate,
    colorPalette,
    useGradients,
  }

  const handleGenerate = async () => {
    setIsLoading(true)
    setUpscaledImage(null)
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          params,
          mode,
          customPrompt,
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setGeneratedImage(data.imageUrl)
    } catch (error: any) {
      toast({
        title: "Error generating image",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpscale = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/upscale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: generatedImage }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setUpscaledImage(data.upscaledImageUrl)
    } catch (error: any) {
      toast({
        title: "Error upscaling image",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container relative flex max-w-5xl flex-col items-center justify-center space-y-10 p-5">
      <ModeToggle className="absolute top-4 right-4" />
      <h1 className="scroll-m-20 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
        Flow Art Generator
      </h1>
      <p className="max-w-[85%] text-sm text-muted-foreground">
        Create mesmerizing generative art with ease. Adjust parameters to explore endless possibilities. You can also
        use AI mode to generate images from a prompt.
      </p>
      <div className="flex w-full flex-col gap-4 md:flex-row">
        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
            <CardDescription>Adjust the settings to your liking.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="iterations">Iterations</Label>
              <Slider
                id="iterations"
                defaultValue={[iterations]}
                max={200}
                min={10}
                step={1}
                onValueChange={(value) => setIterations(value[0])}
              />
              <p className="text-sm text-muted-foreground">Number of iterations for the flow field.</p>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="brushSize">Brush Size</Label>
              <Slider
                id="brushSize"
                defaultValue={[brushSize]}
                max={20}
                min={1}
                step={1}
                onValueChange={(value) => setBrushSize(value[0])}
              />
              <p className="text-sm text-muted-foreground">Size of the brush.</p>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="decayRate">Decay Rate</Label>
              <Slider
                id="decayRate"
                defaultValue={[decayRate]}
                max={0.1}
                min={0.001}
                step={0.001}
                onValueChange={(value) => setDecayRate(value[0])}
              />
              <p className="text-sm text-muted-foreground">Rate at which the flow field decays.</p>
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="colorPalette">Color Palette</Label>
              <Select onValueChange={setColorPalette}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a color palette" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rainbow">Rainbow</SelectItem>
                  <SelectItem value="cool">Cool</SelectItem>
                  <SelectItem value="warm">Warm</SelectItem>
                  <SelectItem value="monochrome">Monochrome</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground">Choose a color palette for the artwork.</p>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="useGradients"
                checked={useGradients}
                onCheckedChange={(checked) => setUseGradients(checked)}
              />
              <Label htmlFor="useGradients">Use Gradients</Label>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Mode</CardTitle>
            <CardDescription>Choose between Flow and AI modes.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <div className="flex items-center space-x-2">
              <Button
                variant={mode === "flow" ? "default" : "outline"}
                onClick={() => setMode("flow")}
                className="w-full"
              >
                Flow
              </Button>
              <Button variant={mode === "ai" ? "default" : "outline"} onClick={() => setMode("ai")} className="w-full">
                AI
              </Button>
            </div>
            {mode === "ai" && (
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="customPrompt">Custom Prompt</Label>
                <Input
                  id="customPrompt"
                  placeholder="A nebula in deep space"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">Enter a prompt for the AI to generate an image from.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="w-full md:w-1/3">
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>Generated artwork.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {generatedImage ? (
              <div className="relative">
                <img src={generatedImage || "/placeholder.svg"} alt="Generated Artwork" className="rounded-md" />
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50 rounded-md">
                    <Loader2 className="w-6 h-6 animate-spin" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center rounded-md bg-muted">
                {isLoading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <p className="text-sm text-muted-foreground">No artwork generated yet.</p>
                )}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button onClick={handleGenerate} disabled={isLoading} className="flex items-center gap-2">
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  Generate
                </>
              )}
            </Button>
            <div className="flex gap-2">
              {generatedImage && (
                <Button onClick={handleUpscale} disabled={isLoading} className="flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Upscaling...
                    </>
                  ) : (
                    <>
                      <Maximize2 className="w-4 h-4" />
                      Upscale
                    </>
                  )}
                </Button>
              )}
              {generatedImage && (
                <a
                  href={upscaledImage || generatedImage}
                  download="artwork.png"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download
                  </Button>
                </a>
              )}
              {generatedImage && (
                <Button onClick={() => setShowSaveDialog(true)} className="flex items-center gap-2">
                  <Heart className="w-4 h-4" />
                  Save to Gallery
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
      <p className="text-center text-sm text-muted-foreground">
        Built by{" "}
        <a
          href="https://twitter.com/steventey"
          target="_blank"
          rel="noopener noreferrer"
          className="underline underline-offset-2"
        >
          Steven Tey
        </a>{" "}
        •{" "}
        <a href="https://github.com/steven-tey/flow-art-generator" target="_blank" rel="noopener noreferrer">
          <Github className="inline-block w-4 h-4" />
          GitHub
        </a>
      </p>
      <SaveArtworkDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSaved={() => {
          toast({
            title: "Artwork saved!",
            description: "Your artwork has been added to the gallery.",
          })
        }}
        imageUrl={generatedImage || ""}
        upscaledImageUrl={upscaledImage || undefined}
        generationParams={params}
        mode={mode}
        customPrompt={mode === "ai" ? customPrompt : undefined}
        upscaleMethod={upscaledImage ? "Real-ESRGAN" : undefined}
      />
    </div>
  )
}
