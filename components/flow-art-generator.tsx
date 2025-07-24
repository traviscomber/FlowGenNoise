"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { toast } from "@/components/ui/use-toast"
import { generateFlowField } from "@/lib/flow-model"
import { drawFlowField } from "@/lib/plot-utils"
import { supabase } from "@/lib/supabase"
import { Loader2, Download, Save, Sparkles, ImageIcon, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"

type Dataset =
  | "spirals"
  | "quantum"
  | "strings"
  | "fractals"
  | "topology"
  | "moons"
  | "circles"
  | "blobs"
  | "checkerboard"
  | "gaussian"
  | "grid"

type Scenario =
  | "pure"
  | "quantum"
  | "cosmic"
  | "microscopic"
  | "forest"
  | "ocean"
  | "neural"
  | "crystalline"
  | "plasma"
  | "atmospheric"
  | "geological"
  | "biological"

type ColorScheme =
  | "plasma"
  | "quantum"
  | "cosmic"
  | "thermal"
  | "spectral"
  | "crystalline"
  | "bioluminescent"
  | "aurora"
  | "metallic"
  | "prismatic"
  | "monochromatic"
  | "infrared"

type StereographicPerspective = "little-planet" | "tunnel"

interface GalleryItem {
  id: string
  image_url: string
  prompt: string
  created_at: string
}

const DATASETS: { value: Dataset; label: string }[] = [
  { value: "spirals", label: "Spirals" },
  { value: "quantum", label: "Quantum Fields" },
  { value: "strings", label: "String Theory" },
  { value: "fractals", label: "Fractals" },
  { value: "topology", label: "Topology" },
  { value: "moons", label: "Moons" },
  { value: "circles", label: "Circles" },
  { value: "blobs", label: "Blobs" },
  { value: "checkerboard", label: "Checkerboard" },
  { value: "gaussian", label: "Gaussian" },
  { value: "grid", label: "Grid" },
]

const SCENARIOS: { value: Scenario; label: string }[] = [
  { value: "pure", label: "Pure Mathematical" },
  { value: "quantum", label: "Quantum Realm" },
  { value: "cosmic", label: "Cosmic Scale" },
  { value: "microscopic", label: "Microscopic World" },
  { value: "forest", label: "Enchanted Forest" },
  { value: "ocean", label: "Deep Ocean" },
  { value: "neural", label: "Neural Network" },
  { value: "crystalline", label: "Crystalline Structures" },
  { value: "plasma", label: "Plasma Dynamics" },
  { value: "atmospheric", label: "Atmospheric Phenomena" },
  { value: "geological", label: "Geological Formations" },
  { value: "biological", label: "Biological Systems" },
]

const COLOR_SCHEMES: { value: ColorScheme; label: string }[] = [
  { value: "plasma", label: "Plasma" },
  { value: "quantum", label: "Quantum" },
  { value: "cosmic", label: "Cosmic" },
  { value: "thermal", label: "Thermal" },
  { value: "spectral", label: "Spectral" },
  { value: "crystalline", label: "Crystalline" },
  { value: "bioluminescent", label: "Bioluminescent" },
  { value: "aurora", label: "Aurora" },
  { value: "metallic", label: "Metallic" },
  { value: "prismatic", label: "Prismatic" },
  { value: "monochromatic", label: "Monochromatic" },
  { value: "infrared", label: "Infrared" },
]

export default function FlowArtGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [width, setWidth] = useState(800)
  const [height, setHeight] = useState(600)
  const [depth] = useState(100) // Fixed depth for 3D space
  const [numSamples, setNumSamples] = useState(5000)
  const [noiseScale, setNoiseScale] = useState(0.1)
  const [dataset, setDataset] = useState<Dataset>("spirals")
  const [scenario, setScenario] = useState<Scenario>("pure")
  const [colorScheme, setColorScheme] = useState<ColorScheme>("plasma")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000))
  const [showConnections, setShowConnections] = useState(false)
  const [showGrid, setShowGrid] = useState(false)
  const [loadingMathArt, setLoadingMathArt] = useState(false)
  const [loadingAIArt, setLoadingAIArt] = useState(false)
  const [loadingUpscale, setLoadingUpscale] = useState(false)
  const [aiArtImage, setAiArtImage] = useState<string | null>(null)
  const [enhancedPrompt, setEnhancedPrompt] = useState<string>("")
  const [customPrompt, setCustomPrompt] = useState<string>("")
  const [gallery, setGallery] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState("math-art")
  const [enableStereographic, setEnableStereographic] = useState(false)
  const [stereographicPerspective, setStereographicPerspective] = useState<StereographicPerspective>("little-planet")
  const [currentPrompt, setCurrentPrompt] = useState<string>("")

  const fetchGallery = useCallback(async () => {
    if (!supabase) return
    try {
      const { data, error } = await supabase.from("gallery").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setGallery(data || [])
    } catch (error: any) {
      toast({
        title: "Error fetching gallery",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [])

  useEffect(() => {
    fetchGallery()
  }, [fetchGallery])

  const generateMathArt = useCallback(() => {
    setLoadingMathArt(true)
    setAiArtImage(null) // Clear AI art when generating math art
    try {
      const canvas = canvasRef.current
      if (!canvas) return

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      canvas.width = width
      canvas.height = height

      const flowField = generateFlowField({
        width,
        height,
        depth,
        numSamples,
        noiseScale,
        dataset,
        scenario,
        colorScheme,
        seed,
        enableStereographic,
        stereographicPerspective,
      })
      drawFlowField(ctx, flowField, width, height, showConnections, showGrid)
      toast({
        title: "Mathematical Art Generated!",
        description: "Your unique mathematical artwork is ready.",
      })
    } catch (error: any) {
      toast({
        title: "Error generating mathematical art",
        description: error.message,
        variant: "destructive",
      })
      console.error("Math art generation error:", error)
    } finally {
      setLoadingMathArt(false)
    }
  }, [
    width,
    height,
    depth,
    numSamples,
    noiseScale,
    dataset,
    scenario,
    colorScheme,
    seed,
    showConnections,
    showGrid,
    enableStereographic,
    stereographicPerspective,
  ])

  useEffect(() => {
    generateMathArt()
  }, [generateMathArt])

  const handleDownload = (imageSrc: string | null, filename: string) => {
    if (!imageSrc) {
      toast({
        title: "No image to download",
        description: "Please generate an image first.",
        variant: "destructive",
      })
      return
    }
    const link = document.createElement("a")
    link.href = imageSrc
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast({
      title: "Image Downloaded!",
      description: `"${filename}" has been saved to your device.`,
    })
  }

  const handleSaveToGallery = async (imageSrc: string | null, prompt: string) => {
    if (!supabase) {
      toast({
        title: "Gallery not available",
        description: "Supabase is not configured. Cannot save to gallery.",
        variant: "destructive",
      })
      return
    }
    if (!imageSrc) {
      toast({
        title: "No image to save",
        description: "Please generate an image first.",
        variant: "destructive",
      })
      return
    }

    try {
      const { data, error } = await supabase
        .from("gallery")
        .insert([{ image_url: imageSrc, prompt: prompt }])
        .select()
      if (error) throw error
      setGallery((prev) => [...(data as GalleryItem[]), ...prev])
      toast({
        title: "Image Saved!",
        description: "Your artwork has been added to the gallery.",
      })
    } catch (error: any) {
      toast({
        title: "Error saving to gallery",
        description: error.message,
        variant: "destructive",
      })
      console.error("Save to gallery error:", error)
    }
  }

  const handleDeleteFromGallery = async (id: string) => {
    if (!supabase) {
      toast({
        title: "Gallery not available",
        description: "Supabase is not configured. Cannot delete from gallery.",
        variant: "destructive",
      })
      return
    }
    try {
      const { error } = await supabase.from("gallery").delete().eq("id", id)
      if (error) throw error
      setGallery((prev) => prev.filter((item) => item.id !== id))
      toast({
        title: "Image Deleted!",
        description: "Artwork removed from gallery.",
      })
    } catch (error: any) {
      toast({
        title: "Error deleting from gallery",
        description: error.message,
        variant: "destructive",
      })
      console.error("Delete from gallery error:", error)
    }
  }

  const enhancePrompt = async () => {
    setLoadingAIArt(true)
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
          currentPrompt,
          enableStereographic,
          stereographicPerspective,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.details || "Failed to enhance prompt")
      setEnhancedPrompt(data.enhancedPrompt)
      setCustomPrompt(data.enhancedPrompt) // Set enhanced prompt as custom prompt
      toast({
        title: "Prompt Enhanced!",
        description: "Your prompt has been artistically refined.",
      })
    } catch (error: any) {
      toast({
        title: "Error enhancing prompt",
        description: error.message,
        variant: "destructive",
      })
      console.error("Prompt enhancement error:", error)
    } finally {
      setLoadingAIArt(false)
    }
  }

  const generateAIArt = async () => {
    setLoadingAIArt(true)
    setAiArtImage(null) // Clear previous AI art
    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples,
          noise: noiseScale,
          customPrompt: customPrompt.trim().length > 0 ? customPrompt : undefined,
          enableStereographic,
          stereographicPerspective,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.detail || "Failed to generate AI art")
      setAiArtImage(data.image)
      setEnhancedPrompt(data.promptUsed) // Store the actual prompt used by AI
      toast({
        title: "AI Art Generated!",
        description: `Image generated by ${data.provider}.`,
      })
    } catch (error: any) {
      toast({
        title: "Error generating AI art",
        description: error.message,
        variant: "destructive",
      })
      console.error("AI art generation error:", error)
    } finally {
      setLoadingAIArt(false)
    }
  }

  const upscaleCurrentArt = async () => {
    let imageToUpscale: string | null = null
    if (activeTab === "math-art") {
      const canvas = canvasRef.current
      if (canvas) {
        imageToUpscale = canvas.toDataURL("image/png")
      }
    } else if (activeTab === "ai-art") {
      imageToUpscale = aiArtImage
    }

    if (!imageToUpscale) {
      toast({
        title: "No image to upscale",
        description: "Please generate an image first.",
        variant: "destructive",
      })
      return
    }

    setLoadingUpscale(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageDataUrl: imageToUpscale }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.details || "Failed to upscale image")

      if (activeTab === "math-art") {
        // For math art, draw the upscaled image back to the canvas
        const canvas = canvasRef.current
        if (canvas) {
          const ctx = canvas.getContext("2d")
          if (ctx) {
            const img = new Image()
            img.onload = () => {
              canvas.width = img.width
              canvas.height = img.height
              ctx.clearRect(0, 0, canvas.width, canvas.height)
              ctx.drawImage(img, 0, 0)
              toast({
                title: "Mathematical Art Upscaled!",
                description: "Your mathematical artwork has been enhanced.",
              })
            }
            img.src = data.upscaledImageUrl
          }
        }
      } else if (activeTab === "ai-art") {
        setAiArtImage(data.upscaledImageUrl)
        toast({
          title: "AI Art Upscaled!",
          description: "Your AI artwork has been enhanced.",
        })
      }
    } catch (error: any) {
      toast({
        title: "Error upscaling image",
        description: error.message,
        variant: "destructive",
      })
      console.error("Upscale error:", error)
    } finally {
      setLoadingUpscale(false)
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full max-w-7xl">
      {/* Controls Panel */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle>FlowSketch Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="dataset">Dataset</Label>
            <Select value={dataset} onValueChange={(value) => setDataset(value as Dataset)}>
              <SelectTrigger id="dataset">
                <SelectValue placeholder="Select a dataset" />
              </SelectTrigger>
              <SelectContent>
                {DATASETS.map((d) => (
                  <SelectItem key={d.value} value={d.value}>
                    {d.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scenario">Scenario</Label>
            <Select value={scenario} onValueChange={(value) => setScenario(value as Scenario)}>
              <SelectTrigger id="scenario">
                <SelectValue placeholder="Select a scenario" />
              </SelectTrigger>
              <SelectContent>
                {SCENARIOS.map((s) => (
                  <SelectItem key={s.value} value={s.value}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="color-scheme">Color Scheme</Label>
            <Select value={colorScheme} onValueChange={(value) => setColorScheme(value as ColorScheme)}>
              <SelectTrigger id="color-scheme">
                <SelectValue placeholder="Select a color scheme" />
              </SelectTrigger>
              <SelectContent>
                {COLOR_SCHEMES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="num-samples">Number of Samples: {numSamples}</Label>
            <Slider
              id="num-samples"
              min={1000}
              max={20000}
              step={100}
              value={[numSamples]}
              onValueChange={(val) => setNumSamples(val[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="noise-scale">Noise Scale: {noiseScale.toFixed(2)}</Label>
            <Slider
              id="noise-scale"
              min={0}
              max={1}
              step={0.01}
              value={[noiseScale]}
              onValueChange={(val) => setNoiseScale(val[0])}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="seed">Seed: {seed}</Label>
            <div className="flex gap-2">
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                className="flex-1"
              />
              <Button onClick={() => setSeed(Math.floor(Math.random() * 100000))}>Random</Button>
            </div>
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="show-connections">Show Connections</Label>
            <Switch
              id="show-connections"
              checked={showConnections}
              onCheckedChange={setShowConnections}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="show-grid">Show Grid</Label>
            <Switch
              id="show-grid"
              checked={showGrid}
              onCheckedChange={setShowGrid}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="enable-stereographic">Stereographic Projection</Label>
            <Switch
              id="enable-stereographic"
              checked={enableStereographic}
              onCheckedChange={setEnableStereographic}
            />
          </div>

          {enableStereographic && (
            <div className="space-y-2">
              <Label htmlFor="stereographic-perspective">Perspective</Label>
              <Select
                value={stereographicPerspective}
                onValueChange={(value) => setStereographicPerspective(value as StereographicPerspective)}
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

          <Button
            onClick={generateMathArt}
            className="w-full"
            disabled={loadingMathArt}
          >
            {loadingMathArt ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
              </>
            ) : (
              "Generate Mathematical Art"
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Art Display and AI Controls */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generated Art</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="math-art">Mathematical Art</TabsTrigger>
              <TabsTrigger value="ai-art">AI Art</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
            <TabsContent value="math-art" className="mt-4">
              <AspectRatio ratio={width / height} className="bg-muted rounded-md overflow-hidden">
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  className="w-full h-full object-contain"
                />
              </AspectRatio>
              <div className="flex gap-2 mt-4">
                <Button
                  onClick={() => handleDownload(canvasRef.current?.toDataURL("image/png") || null, "flowsketch-math-art.png")}
                  disabled={loadingMathArt}
                  className="flex-1"
                >
                  <Download className="mr-2 h-4 w-4" /> Download
                </Button>
                <Button
                  onClick={() => handleSaveToGallery(canvasRef.current?.toDataURL("image/png") || null, enhancedPrompt || "Mathematical Art")}
                  disabled={loadingMathArt || !supabase}
                  className="flex-1"
                >
                  <Save className="mr-2 h-4 w-4" /> Save to Gallery
                </Button>
                <Button
                  onClick={upscaleCurrentArt}
                  disabled={loadingUpscale || loadingMathArt}
                  className="flex-1"
                >
                  {loadingUpscale ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin\" /> Upscaling...
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Upscale
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="ai-art" className="mt-4">
              <div className="space-y-4">
                <Textarea
                  placeholder="Enter your custom prompt for AI art generation..."
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  rows={5}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={enhancePrompt}
                    disabled={loadingAIArt}
                    className="flex-1"
                  >
                    {loadingAIArt ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" /> Enhance Prompt
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={generateAIArt}
                    disabled={loadingAIArt}
                    className="flex-1"
                  >
                    {loadingAIArt ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating...
                      </>
                    ) : (
                      <>
                        <ImageIcon className="mr-2 h-4 w-4" /> Generate AI Art
                      </>
                    )}
                  </Button>
                </div>
              </div>
              {aiArtImage && (
                <div className="mt-4 space-y-2">
                  <AspectRatio ratio={width / height} className="bg-muted rounded-md overflow-hidden">
                    <img src={aiArtImage || "/placeholder.svg"} alt="Generated AI Art" className="w-full h-full object-contain" />
                  </AspectRatio>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleDownload(aiArtImage, "flowsketch-ai-art.png")}
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" /> Download
                    </Button>
                    <Button
                      onClick={() => handleSaveToGallery(aiArtImage, enhancedPrompt)}
                      disabled={!supabase}
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" /> Save to Gallery
                    </Button>
                    <Button
                      onClick={upscaleCurrentArt}
                      disabled={loadingUpscale}
                      className="flex-1"
                    >
                      {loadingUpscale ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin\" /> Upscaling...
                      ) : (
                        <>
                          <Sparkles className="mr-2 h-4 w-4" /> Upscale
                        </>
                      )}
                    </Button>
                  </div>
                  {enhancedPrompt && (
                    <div className="mt-4 p-3 bg-secondary rounded-md text-sm text-muted-foreground">
                      <p className="font-semibold">Prompt Used:</p>
                      <p>{enhancedPrompt}</p>
                    </div>
                  )}
                </div>
              )}
            </TabsContent>
            <TabsContent value="gallery" className="mt-4">
              <ScrollArea className="h-[600px] w-full rounded-md border p-4">
                {gallery.length === 0 ? (
                  <p className="text-center text-muted-foreground">Your gallery is empty. Generate some art!</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {gallery.map((item) => (
                      <Card key={item.id} className="relative group">
                        <CardContent className="p-2">
                          <AspectRatio ratio={width / height} className="bg-muted rounded-md overflow-hidden">
                            <img src={item.image_url || "/placeholder.svg"} alt={item.prompt} className="w-full h-full object-cover" />
                          </AspectRatio>
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{item.prompt}</p>
                          <Button
                            variant="destructive"
                            size="icon"
                            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteFromGallery(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                          <Button
                            variant="secondary"
                            size="icon"
                            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDownload(item.image_url, `flowsketch-gallery-${item.id}.png`)}
                          >
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
