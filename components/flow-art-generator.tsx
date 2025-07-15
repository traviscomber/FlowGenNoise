"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Sparkles, ImageIcon, RefreshCcw, Star, StarOff, Download, Maximize2, X } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import {
  defaultFlowArtSettings,
  datasets,
  scenarios,
  colorSchemes,
  type FlowArtSettings,
  generateDataset,
} from "@/lib/flow-model"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { v4 as uuidv4 } from "uuid"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { compressImage } from "@/lib/image-compression"
import { PlotUtils } from "@/lib/plot-utils" // Ensure PlotUtils is imported

function FlowArtGenerator() {
  const [settings, setSettings] = useState<FlowArtSettings>(defaultFlowArtSettings)
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  // Removed isUpscaling state as upscaling functionality is removed
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiNegativePrompt, setAiNegativePrompt] = useState("")
  const [aiDescription, setAiDescription] = useState("")
  const [currentImageId, setCurrentImageId] = useState<string | null>(null)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const { toast } = useToast()

  const generateArt = useCallback(async () => {
    setIsLoading(true)
    setGeneratedImageUrl(null)
    setCurrentImageId(null)
    setIsFavorite(false)
    setAiDescription("")

    try {
      let imageUrl: string | null = null
      let newAiDescription = ""
      let generationSuccess = true // Flag to track if generation was truly successful

      if (settings.generationMode === "svg") {
        const data = generateDataset(settings.dataset, settings.seed, settings.samples, settings.noise)
        const svg = PlotUtils.createSVGPlot(data, settings.colorScheme, 800, 600)
        const blob = new Blob([svg], { type: "image/svg+xml" })
        imageUrl = URL.createObjectURL(blob)
      } else {
        // AI Generation Mode
        const response = await fetch("/api/generate-ai-art", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: aiPrompt,
            negative_prompt: aiNegativePrompt,
            num_outputs: 1,
            guidance_scale: 7.5,
            num_inference_steps: 50,
            seed: settings.seed,
            dataset: settings.dataset,
            colorScheme: settings.colorScheme,
            numSamples: settings.samples,
            noise: settings.noise,
            scenario: settings.scenario,
            scenarioThreshold: settings.scenarioThreshold, // Pass the new threshold
          }),
        })

        let data: any = {}
        try {
          const ct = response.headers.get("content-type") ?? ""
          if (ct.includes("application/json")) {
            data = await response.json()
          } else {
            // Fallback for non-JSON (e.g. “Internal Server Error” HTML/text)
            const txt = await response.text()
            throw new Error(txt.trim() || "Server returned non-JSON response")
          }
        } catch (parseErr: any) {
          // Parsing failed – surface the text
          throw new Error(parseErr.message || "Failed to parse server response")
        }

        imageUrl = data.image
        newAiDescription = data.aiDescription

        // Check if the returned image is the transparent placeholder, indicating a server-side error
        const TRANSPARENT_PIXEL_BASE64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGMAAQAABQABDQottAAAAABJRU5ErkJggg=="
        const TRANSPARENT_PIXEL_DATA_URL = `data:image/png;base64,${TRANSPARENT_PIXEL_BASE64}`

        if (imageUrl === TRANSPARENT_PIXEL_DATA_URL) {
          generationSuccess = false
          toast({
            title: "AI Generation Issue",
            description: newAiDescription || "AI image generation failed on the server. A placeholder is shown.",
            variant: "destructive",
          })
        } else {
          generationSuccess = true
        }
      }

      if (imageUrl) {
        setGeneratedImageUrl(imageUrl)
        setAiDescription(newAiDescription)
        const newImageId = uuidv4()
        setCurrentImageId(newImageId)

        const newImage: GalleryImage = {
          id: newImageId,
          imageUrl: imageUrl,
          metadata: {
            ...settings,
            createdAt: Date.now(),
            filename: `flowsketch-art-${newImageId}.png`,
            fileSize: 0, // Will be updated after image loads
            cloudStored: false,
            aiPrompt: settings.generationMode === "ai" ? aiPrompt : undefined,
            aiDescription: settings.generationMode === "ai" ? newAiDescription : undefined,
          },
          isFavorite: false,
          tags: [],
        }
        GalleryStorage.saveImage(newImage)
        if (generationSuccess) {
          // Only show success toast if actual image was generated
          toast({
            title: "Art Generated!",
            description: "Your new masterpiece is ready and saved to your local gallery.",
          })
        }
      }
    } catch (error: any) {
      console.error("Error generating art (client-side catch):", error)
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred during art generation.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [settings, aiPrompt, aiNegativePrompt, toast])

  useEffect(() => {
    // Pre-generate an image on component mount
    // Only generate if no image is currently displayed and not loading
    if (!generatedImageUrl && !isLoading) {
      generateArt()
    }
    // Cleanup object URL when component unmounts or image changes
    return () => {
      if (generatedImageUrl && generatedImageUrl.startsWith("blob:")) {
        URL.revokeObjectURL(generatedImageUrl)
      }
    }
  }, [generateArt, generatedImageUrl, isLoading])

  const handleSaveToGallery = useCallback(() => {
    if (!generatedImageUrl || !currentImageId) {
      toast({
        title: "No Image to Save",
        description: "Please generate an image first.",
        variant: "destructive",
      })
      return
    }

    // Retrieve the existing image object from the gallery
    const existingImage = GalleryStorage.getImage(currentImageId)

    if (!existingImage) {
      toast({
        title: "Save Failed",
        description: "Could not find image in gallery to update. Please regenerate.",
        variant: "destructive",
      })
      return
    }

    // Image is already saved when generated, this button just confirms/updates
    toast({
      title: "Saved to Gallery",
      description: "This image is already in your local gallery.",
    })
  }, [generatedImageUrl, currentImageId, toast])

  const handleDownloadImage = useCallback(async () => {
    if (!generatedImageUrl) {
      toast({
        title: "No Image to Download",
        description: "Generate an image first.",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(generatedImageUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `flowsketch-art-${currentImageId || uuidv4()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      toast({
        title: "Download Complete",
        description: "Your image has been downloaded.",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download Failed",
        description: "Could not download the image.",
        variant: "destructive",
      })
    }
  }, [generatedImageUrl, currentImageId, toast])

  const handleToggleFavorite = useCallback(() => {
    if (currentImageId) {
      GalleryStorage.toggleFavorite(currentImageId)
      setIsFavorite((prev) => !prev)
      toast({
        title: isFavorite ? "Removed from Favorites" : "Added to Favorites",
        description: isFavorite
          ? "This image will no longer be marked as a favorite."
          : "This image has been added to your favorites.",
      })
    } else {
      toast({
        title: "Cannot Favorite",
        description: "Please generate and save an image first.",
        variant: "destructive",
      })
    }
  }, [currentImageId, isFavorite, toast])

  const handleImageLoad = useCallback(
    async (event: React.SyntheticEvent<HTMLImageElement, Event>) => {
      if (currentImageId) {
        const img = event.currentTarget
        const originalSize = img.naturalWidth * img.naturalHeight // Pixels, not bytes
        // Estimate file size for PNG (very rough, actual compression varies)
        const estimatedFileSize = Math.round(originalSize / 10) // Example: 10 bytes per pixel for a rough estimate

        // Compress image for storage if it's too large
        let compressedImageUrl = generatedImageUrl
        let compressedFileSize = estimatedFileSize

        if (generatedImageUrl && generatedImageUrl.startsWith("data:image/")) {
          try {
            const compressed = await compressImage(generatedImageUrl, 0.8, 1024, 1024)
            compressedImageUrl = compressed
            // Estimate compressed size (again, very rough)
            compressedFileSize = Math.round(compressed.length * 0.75) // Base64 is ~1.33x larger, so 0.75 to get back to bytes
          } catch (error) {
            console.error("Error compressing image:", error)
            toast({
              title: "Image Compression Failed",
              description: "Could not compress image for gallery storage.",
              variant: "destructive",
            })
          }
        }

        GalleryStorage.updateImageMetadata(currentImageId, {
          fileSize: compressedFileSize,
          imageUrl: compressedImageUrl, // Update with compressed URL if successful
        })
      }
    },
    [currentImageId, generatedImageUrl, toast],
  )

  const handlePresetSelect = useCallback(
    (presetName: string) => {
      const presets = GalleryStorage.getPresets()
      const selectedPreset = presets[presetName]
      if (selectedPreset) {
        setSettings(selectedPreset)
        setAiPrompt(selectedPreset.aiPrompt || "")
        setAiNegativePrompt(selectedPreset.aiNegativePrompt || "")
        toast({
          title: "Preset Loaded",
          description: `Settings loaded from preset: ${presetName}`,
        })
      }
    },
    [toast],
  )

  const handleSavePreset = useCallback(() => {
    const presetName = prompt("Enter a name for this preset:")
    if (presetName) {
      GalleryStorage.savePreset(presetName, {
        ...settings,
        aiPrompt,
        aiNegativePrompt,
      })
      toast({
        title: "Preset Saved",
        description: `Current settings saved as preset: ${presetName}`,
      })
    }
  }, [settings, aiPrompt, aiNegativePrompt, toast])

  const handleDeletePreset = useCallback(() => {
    const presets = GalleryStorage.getPresets()
    const presetNames = Object.keys(presets)
    if (presetNames.length === 0) {
      toast({
        title: "No Presets to Delete",
        description: "You haven't saved any presets yet.",
      })
      return
    }

    const presetToDelete = prompt(`Enter the name of the preset to delete:\n${presetNames.join("\n")}`)
    if (presetToDelete && presets[presetToDelete]) {
      GalleryStorage.deletePreset(presetToDelete)
      toast({
        title: "Preset Deleted",
        description: `Preset '${presetToDelete}' has been removed.`,
      })
    } else if (presetToDelete) {
      toast({
        title: "Preset Not Found",
        description: `No preset named '${presetToDelete}' exists.`,
        variant: "destructive",
      })
    }
  }, [toast])

  const currentPresets = GalleryStorage.getPresets()

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>FlowSketch Art Generator</CardTitle>
        <CardDescription>Generate unique abstract art using mathematical algorithms or AI.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          <Tabs
            defaultValue={settings.generationMode}
            onValueChange={(value) =>
              setSettings((prev) => ({
                ...prev,
                generationMode: value as "svg" | "ai",
              }))
            }
          >
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="svg">
                <ImageIcon className="mr-2 h-4 w-4" /> Mathematical SVG
              </TabsTrigger>
              <TabsTrigger value="ai">
                <Sparkles className="mr-2 h-4 w-4" /> AI Enhanced
              </TabsTrigger>
            </TabsList>
            <TabsContent value="svg" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset</Label>
                <Select
                  value={settings.dataset}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      dataset: value as FlowArtSettings["dataset"],
                    }))
                  }
                >
                  <SelectTrigger id="dataset">
                    <SelectValue placeholder="Select a dataset" />
                  </SelectTrigger>
                  <SelectContent>
                    {datasets.map((d) => (
                      <SelectItem key={d.value} value={d.value}>
                        {d.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      colorScheme: value as FlowArtSettings["colorScheme"],
                    }))
                  }
                >
                  <SelectTrigger id="color-scheme">
                    <SelectValue placeholder="Select a color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="samples">Samples: {settings.samples}</Label>
                <Slider
                  id="samples"
                  min={100}
                  max={5000}
                  step={100}
                  value={[settings.samples]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, samples: value[0] }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="noise">Noise: {settings.noise.toFixed(2)}</Label>
                <Slider
                  id="noise"
                  min={0.01}
                  max={0.5}
                  step={0.01}
                  value={[settings.noise]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, noise: value[0] }))}
                />
              </div>
            </TabsContent>
            <TabsContent value="ai" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">AI Prompt (Overrides dynamic generation if set)</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Describe the art you want to generate (optional). If left empty, AI will generate based on mathematical settings."
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-negative-prompt">Negative Prompt (Optional)</Label>
                <Textarea
                  id="ai-negative-prompt"
                  placeholder="Elements to avoid (e.g., blurry, distorted)..."
                  value={aiNegativePrompt}
                  onChange={(e) => setAiNegativePrompt(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario">Creative Scenario</Label>
                <Select
                  value={settings.scenario}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      scenario: value as FlowArtSettings["scenario"],
                    }))
                  }
                >
                  <SelectTrigger id="scenario">
                    <SelectValue placeholder="Select a creative scenario" />
                  </SelectTrigger>
                  <SelectContent>
                    {scenarios.map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="scenario-threshold">Scenario Blend: {settings.scenarioThreshold}%</Label>
                <Slider
                  id="scenario-threshold"
                  min={0}
                  max={100}
                  step={1}
                  value={[settings.scenarioThreshold]}
                  onValueChange={(value) => setSettings((prev) => ({ ...prev, scenarioThreshold: value[0] }))}
                />
                <p className="text-sm text-muted-foreground">
                  Adjust how much the selected scenario influences the final AI generation. 0% means pure mathematical,
                  100% means strong scenario integration.
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color-scheme-ai">Color Scheme</Label>
                <Select
                  value={settings.colorScheme}
                  onValueChange={(value) =>
                    setSettings((prev) => ({
                      ...prev,
                      colorScheme: value as FlowArtSettings["colorScheme"],
                    }))
                  }
                >
                  <SelectTrigger id="color-scheme-ai">
                    <SelectValue placeholder="Select a color scheme" />
                  </SelectTrigger>
                  <SelectContent>
                    {colorSchemes.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="seed">Seed: {settings.seed}</Label>
            <div className="flex items-center space-x-2">
              <Input
                id="seed"
                type="number"
                value={settings.seed}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    seed: Number.parseInt(e.target.value) || 0,
                  }))
                }
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setSettings((prev) => ({
                    ...prev,
                    seed: Math.floor(Math.random() * 100_000),
                  }))
                }
              >
                <RefreshCcw className="h-4 w-4" />
                <span className="sr-only">Randomize Seed</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="presets">Presets</Label>
            <div className="flex space-x-2">
              <Select onValueChange={handlePresetSelect}>
                <SelectTrigger id="presets" className="flex-grow">
                  <SelectValue placeholder="Load a preset" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(currentPresets).length === 0 ? (
                    <SelectItem disabled value="no-presets">
                      No presets saved
                    </SelectItem>
                  ) : (
                    Object.keys(currentPresets).map((name) => (
                      <SelectItem key={name} value={name}>
                        {name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              <Button variant="outline" onClick={handleSavePreset}>
                Save
              </Button>
              <Button variant="outline" onClick={handleDeletePreset}>
                Delete
              </Button>
            </div>
          </div>

          <Button onClick={generateArt} className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Art"
            )}
          </Button>
        </div>

        <div className="relative flex items-center justify-center rounded-lg border bg-muted/50 p-4">
          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Loader2 className="h-8 w-8 animate-spin" />
              <p>Generating your art...</p>
            </div>
          ) : generatedImageUrl ? (
            <>
              <Image
                src={generatedImageUrl || "/placeholder.png"}
                alt="Generated Art"
                width={800}
                height={600}
                className="max-h-[600px] w-auto rounded-md object-contain"
                onLoad={handleImageLoad}
              />
              <div className="absolute bottom-4 right-4 flex space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleToggleFavorite}
                  className={isFavorite ? "text-yellow-400" : ""}
                >
                  {isFavorite ? <Star fill="currentColor" className="h-4 w-4" /> : <StarOff className="h-4 w-4" />}
                  <span className="sr-only">{isFavorite ? "Unfavorite" : "Favorite"}</span>
                </Button>
                <Button variant="outline" size="icon" onClick={handleDownloadImage}>
                  <Download className="h-4 w-4" />
                  <span className="sr-only">Download Image</span>
                </Button>
                <Dialog open={isFullScreen} onOpenChange={setIsFullScreen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="icon">
                      <Maximize2 className="h-4 w-4" />
                      <span className="sr-only">View Fullscreen</span>
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-screen-xl max-h-screen-xl flex items-center justify-center p-0">
                    <Image
                      src={generatedImageUrl || "/placeholder.png"}
                      alt="Generated Art Fullscreen"
                      layout="fill"
                      objectFit="contain"
                      className="rounded-md"
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-4 top-4 text-white hover:bg-white/20"
                      onClick={() => setIsFullScreen(false)}
                    >
                      <X className="h-6 w-6" />
                      <span className="sr-only">Close Fullscreen</span>
                    </Button>
                  </DialogContent>
                </Dialog>
              </div>
              {aiDescription && settings.generationMode === "ai" && (
                <div className="absolute bottom-4 left-4 max-w-[calc(100%-120px)] rounded-md bg-black/50 p-2 text-sm text-white backdrop-blur-sm">
                  <p className="line-clamp-3">{aiDescription}</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="h-12 w-12" />
              <p>Your art will appear here</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// ──────────────────────────────────────────────────────────────────────────────
// Exports
// Provide both a named and the existing default export so imports like
// `import { FlowArtGenerator } from "@/components/flow-art-generator"` work.
export { FlowArtGenerator }
export default FlowArtGenerator
