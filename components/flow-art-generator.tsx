"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles, ImagePlus, Save, GalleryHorizontal } from "lucide-react"
import Image from "next/image"
import { useToast } from "@/hooks/use-toast"
import { SaveArtworkDialog } from "@/components/gallery/save-artwork-dialog"
import Link from "next/link"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface Dataset {
  id: string
  name: string
  type: "scientific" | "artistic"
  scenarios: { id: string; name: string; defaultPrompt: string }[]
}

const datasets: Dataset[] = [
  {
    id: "scientific",
    name: "Scientific Data",
    type: "scientific",
    scenarios: [
      { id: "fractal", name: "Fractal Geometry", defaultPrompt: "A complex fractal pattern" },
      { id: "quantum", name: "Quantum Entanglement", defaultPrompt: "Two entangled particles" },
      { id: "neural", name: "Neural Network", defaultPrompt: "An abstract neural network" },
      { id: "cosmic", name: "Cosmic Microwave Background", defaultPrompt: "Cosmic background radiation" },
    ],
  },
  {
    id: "nature",
    name: "Nature Scenes",
    type: "artistic",
    scenarios: [
      { id: "forest", name: "Enchanted Forest", defaultPrompt: "A mystical forest with glowing flora" },
      { id: "ocean", name: "Deep Sea Abyss", defaultPrompt: "Bioluminescent creatures in the deep ocean" },
      { id: "mountain", name: "Aurora Mountains", defaultPrompt: "Mountains under an aurora borealis" },
    ],
  },
  {
    id: "abstract",
    name: "Abstract Concepts",
    type: "artistic",
    scenarios: [
      { id: "emotion", name: "Emotional Landscape", defaultPrompt: "An abstract representation of joy" },
      { id: "music", name: "Visualizing Music", defaultPrompt: "Abstract forms inspired by classical music" },
      { id: "dream", name: "Surreal Dreamscape", defaultPrompt: "A surreal dreamscape with floating islands" },
    ],
  },
]

export function FlowArtGenerator() {
  const [selectedDatasetId, setSelectedDatasetId] = useState<string>(datasets[0].id)
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>(datasets[0].scenarios[0].id)
  const [prompt, setPrompt] = useState<string>("")
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedAltText, setGeneratedAltText] = useState<string>("")
  const [loading, setLoading] = useState(false)
  const [upscaling, setUpscaling] = useState(false)
  const [enhancingPrompt, setEnhancingPrompt] = useState(false)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)

  const { toast } = useToast()

  const selectedDataset = useMemo(() => datasets.find((d) => d.id === selectedDatasetId), [selectedDatasetId])

  const selectedScenario = useMemo(
    () => selectedDataset?.scenarios.find((s) => s.id === selectedScenarioId),
    [selectedDataset, selectedScenarioId],
  )

  useEffect(() => {
    if (selectedScenario) {
      setPrompt(selectedScenario.defaultPrompt)
    }
  }, [selectedScenario])

  const handleGenerateArt = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    setGeneratedImageUrl(null)
    setGeneratedAltText("")

    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate art")
      }

      const data = await response.json()
      setGeneratedImageUrl(data.imageUrl)
      setGeneratedAltText(data.altText)
      toast({
        title: "Success",
        description: "Art generated successfully!",
      })
    } catch (error: any) {
      console.error("Error generating art:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to generate art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUpscaleImage = async () => {
    if (!generatedImageUrl) {
      toast({
        title: "Error",
        description: "No image to upscale.",
        variant: "destructive",
      })
      return
    }

    setUpscaling(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: generatedImageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upscale image")
      }

      const data = await response.json()
      setGeneratedImageUrl(data.upscaledUrl) // Update with upscaled URL
      toast({
        title: "Success",
        description: "Image upscaled successfully!",
      })
    } catch (error: any) {
      console.error("Error upscaling image:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to upscale image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpscaling(false)
    }
  }

  const handleEnhancePrompt = async () => {
    if (!prompt) {
      toast({
        title: "Error",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      })
      return
    }

    setEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          datasetType: selectedDataset?.type, // Pass dataset type for conditional enhancement
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to enhance prompt")
      }

      const data = await response.json()
      setPrompt(data.enhancedPrompt)
      toast({
        title: "Success",
        description: "Prompt enhanced!",
      })
    } catch (error: any) {
      console.error("Error enhancing prompt:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to enhance prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setEnhancingPrompt(false)
    }
  }

  const handleSaveArtwork = () => {
    if (!generatedImageUrl) {
      toast({
        title: "Error",
        description: "No artwork to save.",
        variant: "destructive",
      })
      return
    }
    setIsSaveDialogOpen(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Art Generator
        </h1>
        <p className="mt-3 text-xl text-gray-600">Transform data and concepts into stunning AI-generated art.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Left Panel: Controls */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Generate Art</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={selectedDatasetId} onValueChange={setSelectedDatasetId}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {datasets.map((dataset) => (
                    <SelectItem key={dataset.id} value={dataset.id}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="scenario">Scenario</Label>
              <Select value={selectedScenarioId} onValueChange={setSelectedScenarioId}>
                <SelectTrigger id="scenario">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {selectedDataset?.scenarios.map((scenario) => (
                    <SelectItem key={scenario.id} value={scenario.id}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder={
                  enhancingPrompt
                    ? "AI is crafting your prompt..."
                    : selectedDataset?.type === "scientific"
                      ? "Describe your scientific concept (e.g., 'black hole singularity', 'DNA helix structure')"
                      : "Describe your artistic vision (e.g., 'a serene landscape', 'a futuristic city')"
                }
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={5}
                className="min-h-[120px]"
                disabled={enhancingPrompt}
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={handleEnhancePrompt}
                      disabled={enhancingPrompt || !prompt}
                      className="w-full bg-purple-600 hover:bg-purple-700 text-white"
                    >
                      {enhancingPrompt ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Enhancing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" />
                          Enhance Prompt
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Let AI refine your prompt for better artistic results. For scientific datasets, it will add
                      mathematical and scientific details. For other datasets, it will add artistic styles and
                      descriptions.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            <Button
              onClick={handleGenerateArt}
              disabled={loading || enhancingPrompt}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImagePlus className="mr-2 h-4 w-4" />
                  Generate Art
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Right Panel: Generated Art */}
        <Card className="bg-white/80 backdrop-blur-sm shadow-lg flex flex-col">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-gray-800">Generated Artwork</CardTitle>
          </CardHeader>
          <CardContent className="flex-grow flex flex-col items-center justify-center p-4">
            {loading && (
              <div className="flex flex-col items-center space-y-4">
                <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                <p className="text-gray-600">Generating your masterpiece...</p>
              </div>
            )}
            {generatedImageUrl && !loading && (
              <div className="relative w-full h-auto max-w-md aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-md">
                <Image
                  src={generatedImageUrl || "/placeholder.svg"}
                  alt={generatedAltText || "Generated AI art"}
                  layout="fill"
                  objectFit="contain"
                  className="animate-in fade-in duration-500"
                />
              </div>
            )}
            {!generatedImageUrl && !loading && (
              <div className="text-center text-gray-500">
                <ImagePlus className="mx-auto h-16 w-16 text-gray-300" />
                <p className="mt-2">Your generated art will appear here.</p>
              </div>
            )}
          </CardContent>
          {generatedImageUrl && !loading && (
            <div className="p-4 border-t border-gray-200 flex flex-col sm:flex-row gap-3 justify-end">
              <Button
                onClick={handleUpscaleImage}
                disabled={upscaling}
                variant="outline"
                className="flex-1 sm:flex-none bg-transparent"
              >
                {upscaling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Upscaling...
                  </>
                ) : (
                  <>
                    <ImagePlus className="mr-2 h-4 w-4" />
                    Upscale Image
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveArtwork}
                disabled={!generatedImageUrl}
                className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white"
              >
                <Save className="mr-2 h-4 w-4" />
                Save to Gallery
              </Button>
              <Link href="/gallery" passHref>
                <Button variant="outline" className="flex-1 sm:flex-none bg-transparent">
                  <GalleryHorizontal className="mr-2 h-4 w-4" />
                  View Gallery
                </Button>
              </Link>
            </div>
          )}
        </Card>
      </div>

      {generatedImageUrl && (
        <SaveArtworkDialog
          isOpen={isSaveDialogOpen}
          onClose={() => setIsSaveDialogOpen(false)}
          onSave={() => {
            // This function is handled by the dialog itself,
            // but we need to trigger a refresh of the gallery
            // after the dialog successfully saves.
            // The dialog's onSave prop will handle the actual saving.
          }}
          initialImageUrl={generatedImageUrl}
          initialPrompt={prompt}
          initialDataset={selectedDataset?.name || "Unknown"}
          initialScenario={selectedScenario?.name || "Unknown"}
        />
      )}
    </div>
  )
}
