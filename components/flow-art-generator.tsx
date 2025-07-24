"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import Image from "next/image"
import { Loader2, Download, Trash2, Expand, Sparkles, Wand2 } from "lucide-react"
import { createClient } from "@supabase/supabase-js"

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface GalleryItem {
  id: string
  imageUrl: string
  prompt: string
  createdAt: string
}

export default function FlowArtGenerator() {
  const [dataset, setDataset] = useState("mandelbrot")
  const [scenario, setScenario] = useState("zoom")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [numSamples, setNumSamples] = useState(100000)
  const [noiseScale, setNoiseScale] = useState(0.01)
  const [customPrompt, setCustomPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [generatedSvg, setGeneratedSvg] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isEnhancing, setIsEnhancing] = useState(false)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<GalleryItem | null>(null)
  const [enableStereographic, setEnableStereographic] = useState(false)
  const [stereographicPerspective, setStereographicPerspective] = useState<"little-planet" | "tunnel">("little-planet")

  const fetchGallery = useCallback(async () => {
    const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
    if (error) {
      console.error("Error fetching gallery:", error)
      toast.error("Failed to load gallery items.")
    } else {
      setGallery(
        data.map((item) => ({
          id: item.id,
          imageUrl: item.image_url,
          prompt: item.prompt,
          createdAt: item.created_at,
        })),
      )
    }
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const handleGenerateArt = async () => {
    setIsLoading(true)
    setGeneratedImageUrl(null)
    setGeneratedSvg(null)
    try {
      // First, generate the mathematical SVG
      const svgResponse = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale,
          enableStereographic,
          stereographicPerspective,
        }),
      })
      if (!svgResponse.ok) throw new Error("Failed to generate mathematical art")
      const { svg } = await svgResponse.json()
      setGeneratedSvg(svg)

      // Then, generate AI art based on the (potentially enhanced) prompt
      const promptToUse =
        enhancedPrompt ||
        customPrompt ||
        `Abstract mathematical art based on ${dataset} dataset, ${scenario} scenario, ${colorScheme} color scheme, ${numSamples} samples, ${noiseScale} noise scale. ${enableStereographic ? `With a ${stereographicPerspective === "little-planet" ? "little planet" : "tunnel vision"} stereographic projection.` : ""}`

      const aiArtResponse = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptToUse }),
      })
      if (!aiArtResponse.ok) throw new Error("Failed to generate AI art")
      const { imageUrl } = await aiArtResponse.json()
      setGeneratedImageUrl(imageUrl)
      toast.success("Art generated successfully!")

      // Save to gallery
      const { error } = await supabase.from("gallery_items").insert({
        image_url: imageUrl,
        prompt: promptToUse,
      })
      if (error) {
        console.error("Error saving to gallery:", error)
        toast.error("Failed to save art to gallery.")
      } else {
        fetchGallery() // Refresh gallery
      }
    } catch (error: any) {
      toast.error(`Error generating art: ${error.message}`)
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEnhancePrompt = async () => {
    setIsEnhancing(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          numSamples,
          noiseScale,
          currentPrompt: customPrompt,
          enableStereographic,
          stereographicPerspective,
        }),
      })
      if (!response.ok) throw new Error("Failed to enhance prompt")
      const { enhancedPrompt: newEnhancedPrompt } = await response.json()
      setEnhancedPrompt(newEnhancedPrompt)
      toast.success("Prompt enhanced successfully!")
    } catch (error: any) {
      toast.error(`Error enhancing prompt: ${error.message}`)
      console.error(error)
    } finally {
      setIsEnhancing(false)
    }
  }

  const handleUpscaleImage = async (imageUrl: string) => {
    setIsUpscaling(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl }),
      })
      if (!response.ok) throw new Error("Failed to upscale image")
      const { upscaledImageUrl } = await response.json()
      setGeneratedImageUrl(upscaledImageUrl) // Replace with upscaled image
      toast.success("Image upscaled successfully!")
    } catch (error: any) {
      toast.error(`Error upscaling image: ${error.message}`)
      console.error(error)
    } finally {
      setIsUpscaling(false)
    }
  }

  const handleDeleteGalleryItem = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    const { error } = await supabase.from("gallery_items").delete().eq("id", id)
    if (error) {
      console.error("Error deleting gallery item:", error)
      toast.error("Failed to delete gallery item.")
    } else {
      toast.success("Gallery item deleted.")
      fetchGallery()
      if (selectedGalleryItem?.id === id) {
        setSelectedGalleryItem(null)
      }
    }
  }

  return (
    <div className="flex min-h-screen w-full flex-col items-center bg-gray-50 p-4 dark:bg-gray-950 md:p-8">
      <Card className="w-full max-w-6xl">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">FlowSketch Art Generator</CardTitle>
          <CardDescription>
            Generate abstract mathematical art, enhance prompts with AI, and explore stereographic projections.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-8 md:grid-cols-2">
          {/* Controls Section */}
          <div className="space-y-6">
            <Tabs defaultValue="generate">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="generate">Generate Art</TabsTrigger>
                <TabsTrigger value="gallery">Gallery</TabsTrigger>
              </TabsList>
              <TabsContent value="generate" className="space-y-6 pt-4">
                <div className="grid gap-4">
                  <Label htmlFor="dataset">Dataset</Label>
                  <Select value={dataset} onValueChange={setDataset}>
                    <SelectTrigger id="dataset">
                      <SelectValue placeholder="Select dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mandelbrot">Mandelbrot</SelectItem>
                      <SelectItem value="julia">Julia</SelectItem>
                      <SelectItem value="lorenz">Lorenz Attractor</SelectItem>
                      <SelectItem value="sierpinski">Sierpinski Triangle</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <Label htmlFor="scenario">Scenario</Label>
                  <Select value={scenario} onValueChange={setScenario}>
                    <SelectTrigger id="scenario">
                      <SelectValue placeholder="Select scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="zoom">Zoom In</SelectItem>
                      <SelectItem value="rotate">Rotate</SelectItem>
                      <SelectItem value="morph">Morph</SelectItem>
                      <SelectItem value="fractal-walk">Fractal Walk</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <Label htmlFor="colorScheme">Color Scheme</Label>
                  <Select value={colorScheme} onValueChange={setColorScheme}>
                    <SelectTrigger id="colorScheme">
                      <SelectValue placeholder="Select color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plasma">Plasma</SelectItem>
                      <SelectItem value="viridis">Viridis</SelectItem>
                      <SelectItem value="magma">Magma</SelectItem>
                      <SelectItem value="cividis">Cividis</SelectItem>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-4">
                  <Label htmlFor="numSamples">Number of Samples: {numSamples.toLocaleString()}</Label>
                  <Slider
                    id="numSamples"
                    min={10000}
                    max={500000}
                    step={10000}
                    value={[numSamples]}
                    onValueChange={(val) => setNumSamples(val[0])}
                  />
                </div>

                <div className="grid gap-4">
                  <Label htmlFor="noiseScale">Noise Scale: {noiseScale.toFixed(3)}</Label>
                  <Slider
                    id="noiseScale"
                    min={0.001}
                    max={0.1}
                    step={0.001}
                    value={[noiseScale]}
                    onValueChange={(val) => setNoiseScale(val[0])}
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="enable-stereographic"
                    checked={enableStereographic}
                    onCheckedChange={setEnableStereographic}
                  />
                  <Label htmlFor="enable-stereographic">Enable Stereographic Projection</Label>
                </div>

                {enableStereographic && (
                  <div className="grid gap-4">
                    <Label htmlFor="stereographic-perspective">Perspective</Label>
                    <Select
                      value={stereographicPerspective}
                      onValueChange={(val) => setStereographicPerspective(val as "little-planet" | "tunnel")}
                    >
                      <SelectTrigger id="stereographic-perspective">
                        <SelectValue placeholder="Select perspective" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="little-planet">Little Planet</SelectItem>
                        <SelectItem value="tunnel">Tunnel Vision</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="grid gap-4">
                  <Label htmlFor="customPrompt">Custom Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Describe your desired artwork in detail..."
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={4}
                  />
                  <Button onClick={handleEnhancePrompt} disabled={isEnhancing || isLoading} className="w-full">
                    {isEnhancing ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Enhance Prompt
                      </>
                    )}
                  </Button>
                </div>

                {enhancedPrompt && (
                  <div className="grid gap-4">
                    <Label>Enhanced Prompt</Label>
                    <Textarea value={enhancedPrompt} readOnly rows={6} className="bg-gray-100 dark:bg-gray-800" />
                  </div>
                )}

                <Button onClick={handleGenerateArt} disabled={isLoading || isEnhancing} className="w-full">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Art...
                    </>
                  ) : (
                    <>
                      <Wand2 className="mr-2 h-4 w-4" /> Generate Art
                    </>
                  )}
                </Button>
              </TabsContent>

              <TabsContent value="gallery" className="pt-4">
                <h3 className="text-lg font-semibold mb-4">Your Art Gallery</h3>
                {gallery.length === 0 ? (
                  <p className="text-gray-500 dark:text-gray-400">No art generated yet. Start creating!</p>
                ) : (
                  <ScrollArea className="h-[500px] pr-4">
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                      {gallery.map((item) => (
                        <Card key={item.id} className="relative group overflow-hidden">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.prompt}
                            width={200}
                            height={200}
                            className="w-full h-auto object-cover aspect-square"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-gray-200"
                              onClick={() => setSelectedGalleryItem(item)}
                            >
                              <Expand className="h-6 w-6" />
                              <span className="sr-only">View details</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-white hover:text-red-400 ml-2"
                              onClick={() => handleDeleteGalleryItem(item.id)}
                            >
                              <Trash2 className="h-6 w-6" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Output Section */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Generated Art</h3>
            <Card className="flex h-[400px] items-center justify-center bg-gray-100 dark:bg-gray-800">
              {isLoading ? (
                <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
              ) : generatedImageUrl ? (
                <div className="relative w-full h-full">
                  <Image
                    src={generatedImageUrl || "/placeholder.svg"}
                    alt="Generated AI Art"
                    layout="fill"
                    objectFit="contain"
                    className="rounded-md"
                  />
                </div>
              ) : generatedSvg ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: generatedSvg }}
                />
              ) : (
                <p className="text-gray-500 dark:text-gray-400">Your art will appear here.</p>
              )}
            </Card>
            {generatedImageUrl && (
              <div className="flex gap-2">
                <Button asChild>
                  <a href={generatedImageUrl} download="flowsketch_art.png">
                    <Download className="mr-2 h-4 w-4" /> Download Image
                  </a>
                </Button>
                <Button onClick={() => handleUpscaleImage(generatedImageUrl)} disabled={isUpscaling}>
                  {isUpscaling ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upscaling...
                    </>
                  ) : (
                    <>
                      <Expand className="mr-2 h-4 w-4" /> Upscale Image
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Gallery Item Dialog */}
      {selectedGalleryItem && (
        <Dialog open={!!selectedGalleryItem} onOpenChange={() => setSelectedGalleryItem(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>Art Details</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="relative w-full h-[400px]">
                <Image
                  src={selectedGalleryItem.imageUrl || "/placeholder.svg"}
                  alt={selectedGalleryItem.prompt}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-md"
                />
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Prompt:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedGalleryItem.prompt}</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold">Generated On:</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {new Date(selectedGalleryItem.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button asChild>
                <a href={selectedGalleryItem.imageUrl} download="flowsketch_art.png">
                  <Download className="mr-2 h-4 w-4" /> Download
                </a>
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteGalleryItem(selectedGalleryItem.id)}>
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
