"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Download, Trash2, RefreshCcw, Sparkles, ImageUp, Save } from "lucide-react"
import { generateFlowArtData } from "@/lib/flow-model"
import { drawFlowArt, downloadImage, getSvgDataUrl } from "@/lib/plot-utils"
import { ClientUpscaler } from "@/lib/client-upscaler"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

let supabase: ReturnType<typeof createClient> | null = null

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
} else {
  console.error("Supabase environment variables are not set. Gallery features will be disabled.")
}

interface GalleryItem {
  id: string
  image_url: string
  prompt: string
  created_at: string
  params: any // Store generation parameters
}

export function FlowArtGenerator() {
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const [upscaleLoading, setUpscaleLoading] = useState(false)
  const [galleryLoading, setGalleryLoading] = useState(false)
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [aiArtPrompt, setAiArtPrompt] = useState("")
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])

  // Generation parameters
  const [dataset, setDataset] = useState("spirals")
  const [scenario, setScenario] = useState("pure")
  const [colorScheme, setColorScheme] = useState("plasma")
  const [seed, setSeed] = useState(Math.floor(Math.random() * 100000))
  const [numSamples, setNumSamples] = useState(50000)
  const [noiseScale, setNoiseScale] = useState(0.01)
  const [timeStep, setTimeStep] = useState(0.01)
  const [enableStereographic, setEnableStereographic] = useState(false)
  const [stereographicPerspective, setStereographicPerspective] = useState("little_planet")

  const datasets = [
    { value: "spirals", label: "Quantum Spirals" },
    { value: "quantum", label: "Quantum Fields" },
    { value: "strings", label: "String Theory" },
    { value: "fractals", label: "Fractal Dimensions" },
    { value: "topology", label: "Topological Spaces" },
    { value: "checkerboard", label: "Fractal Checkerboard" },
    { value: "moons", label: "Hyperbolic Moons" },
    { value: "gaussian", label: "Multi-Modal Gaussian" },
    { value: "grid", label: "Non-Linear Grids" },
    { value: "circles", label: "Concentric Manifolds" },
    { value: "blobs", label: "Voronoi Dynamics" },
  ]

  const scenarios = [
    { value: "pure", label: "Pure Mathematical" },
    { value: "quantum", label: "Quantum Realm" },
    { value: "cosmic", label: "Cosmic Scale" },
    { value: "microscopic", label: "Microscopic World" },
    { value: "living_forest", label: "Living Forest" },
    { value: "deep_ocean", label: "Deep Ocean" },
    { value: "neural", label: "Neural Networks" },
    { value: "crystal", label: "Crystal Lattice" },
    { value: "plasma", label: "Plasma Physics" },
    { value: "atmospheric", label: "Atmospheric Physics" },
    { value: "geological", label: "Geological Time" },
    { value: "biological", label: "Biological Systems" },
  ]

  const colorSchemes = [
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
    { value: "lava", label: "Lava" },
    { value: "futuristic", label: "Futuristic" },
    { value: "forest", label: "Forest" },
    { value: "ocean", label: "Ocean" },
    { value: "sunset", label: "Sunset" },
    { value: "arctic", label: "Arctic" },
    { value: "neon", label: "Neon" },
    { value: "vintage", label: "Vintage" },
    { value: "toxic", label: "Toxic" },
    { value: "ember", label: "Ember" },
  ]

  const stereographicOptions = [
    { value: "little_planet", label: "Little Planet" },
    { value: "tunnel_vision", label: "Tunnel Vision" },
  ]

  const generateArt = useCallback(async () => {
    setLoading(true)
    setImageUrl(null)
    try {
      const params = {
        dataset,
        scenario,
        colorScheme,
        seed,
        numSamples,
        noiseScale,
        timeStep,
        enableStereographic,
        stereographicPerspective,
        width: 1024, // Fixed width for generation
        height: 1024, // Fixed height for generation
      }

      // Client-side generation for mathematical art
      const { points, colors } = generateFlowArtData(params)
      const canvas = canvasRef.current
      if (canvas) {
        drawFlowArt(canvas, points, colors, enableStereographic, stereographicPerspective)
        const dataUrl = canvas.toDataURL("image/png")
        setImageUrl(dataUrl)
        setCurrentPrompt(
          `Mathematical art: ${dataset} dataset, ${scenario} scenario, ${colorScheme} colors, seed ${seed}`,
        )
        toast({
          title: "Art Generated!",
          description: "Your mathematical masterpiece is ready.",
        })
      }
    } catch (error) {
      console.error("Error generating art:", error)
      toast({
        title: "Generation Failed",
        description: "There was an error generating your art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    enableStereographic,
    stereographicPerspective,
    toast,
  ])

  const generateAiArt = useCallback(async () => {
    setAiLoading(true)
    setImageUrl(null)
    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiArtPrompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate AI art")
      }

      const data = await response.json()
      setImageUrl(data.imageUrl)
      setCurrentPrompt(aiArtPrompt)
      toast({
        title: "AI Art Generated!",
        description: "Your AI masterpiece is ready.",
      })
    } catch (error: any) {
      console.error("Error generating AI art:", error)
      toast({
        title: "AI Generation Failed",
        description: error.message || "There was an error generating AI art. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
    }
  }, [aiArtPrompt, toast])

  const enhancePrompt = useCallback(async () => {
    setAiLoading(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: aiArtPrompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to enhance prompt")
      }

      const data = await response.json()
      setAiArtPrompt(data.enhancedPrompt)
      toast({
        title: "Prompt Enhanced!",
        description: "Your prompt has been creatively enhanced.",
      })
    } catch (error: any) {
      console.error("Error enhancing prompt:", error)
      toast({
        title: "Prompt Enhancement Failed",
        description: error.message || "There was an error enhancing your prompt. Please try again.",
        variant: "destructive",
      })
    } finally {
      setAiLoading(false)
    }
  }, [aiArtPrompt, toast])

  const upscaleImage = useCallback(async () => {
    if (!imageUrl) {
      toast({
        title: "No Image to Upscale",
        description: "Please generate an image first.",
        variant: "destructive",
      })
      return
    }

    setUpscaleLoading(true)
    try {
      // For mathematical art (SVG), we can regenerate at higher resolution
      if (imageUrl.startsWith("data:image/svg+xml")) {
        const params = {
          dataset,
          scenario,
          colorScheme,
          seed,
          numSamples: numSamples * 4, // Increase samples for higher detail
          noiseScale,
          timeStep,
          enableStereographic,
          stereographicPerspective,
          width: 2048, // Double resolution
          height: 2048,
        }
        const { points, colors } = generateFlowArtData(params)
        const highResSvgDataUrl = getSvgDataUrl(
          points,
          colors,
          enableStereographic,
          stereographicPerspective,
          params.width,
          params.height,
        )
        setImageUrl(highResSvgDataUrl)
        toast({
          title: "Mathematical Art Upscaled!",
          description: "Your SVG art has been regenerated at higher resolution.",
        })
      } else {
        // For AI art (PNG/JPG), use client-side upscaler
        const upscaledDataUrl = await ClientUpscaler.upscaleImage(imageUrl, 2) // Scale by 2x
        setImageUrl(upscaledDataUrl)
        toast({
          title: "AI Art Upscaled!",
          description: "Your AI art has been enhanced using client-side upscaling.",
        })
      }
    } catch (error) {
      console.error("Error upscaling image:", error)
      toast({
        title: "Upscaling Failed",
        description: "There was an error upscaling the image. Please try again.",
        variant: "destructive",
      })
    } finally {
      setUpscaleLoading(false)
    }
  }, [
    imageUrl,
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    enableStereographic,
    stereographicPerspective,
    toast,
  ])

  const fetchGalleryItems = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Cannot fetch gallery items.")
      return
    }
    setGalleryLoading(true)
    try {
      const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setGalleryItems(data as GalleryItem[])
    } catch (error: any) {
      console.error("Error fetching gallery items:", error)
      toast({
        title: "Gallery Load Failed",
        description: error.message || "Could not load gallery items.",
        variant: "destructive",
      })
    } finally {
      setGalleryLoading(false)
    }
  }, [toast])

  const saveToGallery = useCallback(async () => {
    if (!imageUrl) {
      toast({
        title: "No Image to Save",
        description: "Generate an image before saving to gallery.",
        variant: "destructive",
      })
      return
    }
    if (!supabase) {
      toast({
        title: "Supabase Not Configured",
        description:
          "Gallery features are disabled. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
        variant: "destructive",
      })
      return
    }

    setLoading(true) // Use general loading for saving
    try {
      const { data, error } = await supabase
        .from("gallery_items")
        .insert([
          {
            image_url: imageUrl,
            prompt: currentPrompt,
            params: {
              dataset,
              scenario,
              colorScheme,
              seed,
              numSamples,
              noiseScale,
              timeStep,
              enableStereographic,
              stereographicPerspective,
            },
          },
        ])
        .select()

      if (error) throw error

      if (data && data.length > 0) {
        setGalleryItems((prev) => [data[0] as GalleryItem, ...prev])
        toast({
          title: "Saved to Gallery!",
          description: "Your art has been successfully saved.",
        })
      }
    } catch (error: any) {
      console.error("Error saving to gallery:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Could not save art to gallery.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [
    imageUrl,
    currentPrompt,
    dataset,
    scenario,
    colorScheme,
    seed,
    numSamples,
    noiseScale,
    timeStep,
    enableStereographic,
    stereographicPerspective,
    toast,
  ])

  const loadFromGallery = useCallback(
    (item: GalleryItem) => {
      setImageUrl(item.image_url)
      setCurrentPrompt(item.prompt)
      if (item.params) {
        setDataset(item.params.dataset || "spirals")
        setScenario(item.params.scenario || "pure")
        setColorScheme(item.params.colorScheme || "plasma")
        setSeed(item.params.seed || Math.floor(Math.random() * 100000))
        setNumSamples(item.params.numSamples || 50000)
        setNoiseScale(item.params.noiseScale || 0.01)
        setTimeStep(item.params.timeStep || 0.01)
        setEnableStereographic(item.params.enableStereographic || false)
        setStereographicPerspective(item.params.stereographicPerspective || "little_planet")
      }
      toast({
        title: "Art Loaded!",
        description: "Parameters and image loaded from gallery.",
      })
    },
    [toast],
  )

  const deleteFromGallery = useCallback(
    async (id: string) => {
      if (!supabase) {
        toast({
          title: "Supabase Not Configured",
          description: "Gallery features are disabled. Cannot delete items.",
          variant: "destructive",
        })
        return
      }
      setGalleryLoading(true)
      try {
        const { error } = await supabase.from("gallery_items").delete().eq("id", id)
        if (error) throw error
        setGalleryItems((prev) => prev.filter((item) => item.id !== id))
        toast({
          title: "Item Deleted",
          description: "Art removed from gallery.",
        })
      } catch (error: any) {
        console.error("Error deleting gallery item:", error)
        toast({
          title: "Deletion Failed",
          description: error.message || "Could not delete item from gallery.",
          variant: "destructive",
        })
      } finally {
        setGalleryLoading(false)
      }
    },
    [toast],
  )

  useEffect(() => {
    generateArt()
    if (supabase) {
      fetchGalleryItems()
    }
  }, [generateArt, fetchGalleryItems, supabase])

  return (
    <div className="flex flex-col lg:flex-row h-full w-full max-w-7xl mx-auto p-4 gap-4">
      {/* Left Panel: Controls */}
      <Card className="w-full lg:w-1/3 flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            FlowSketch Controls
          </CardTitle>
          <CardDescription>Adjust parameters to generate unique mathematical art.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="math-art" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="math-art">Mathematical Art</TabsTrigger>
              <TabsTrigger value="ai-art">AI Art</TabsTrigger>
            </TabsList>
            <TabsContent value="math-art" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="dataset">Dataset</Label>
                <Select value={dataset} onValueChange={setDataset}>
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
                <Label htmlFor="scenario">Scenario</Label>
                <Select value={scenario} onValueChange={setScenario}>
                  <SelectTrigger id="scenario">
                    <SelectValue placeholder="Select a scenario" />
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
                <Label htmlFor="color-scheme">Color Scheme</Label>
                <Select value={colorScheme} onValueChange={setColorScheme}>
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
                <Label htmlFor="seed">Seed: {seed}</Label>
                <Slider
                  id="seed"
                  min={0}
                  max={100000}
                  step={1}
                  value={[seed]}
                  onValueChange={(val) => setSeed(val[0])}
                />
                <Button variant="outline" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
                  Random Seed <RefreshCcw className="ml-2 h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="num-samples">Number of Samples: {numSamples.toLocaleString()}</Label>
                <Slider
                  id="num-samples"
                  min={10000}
                  max={200000}
                  step={1000}
                  value={[numSamples]}
                  onValueChange={(val) => setNumSamples(val[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="noise-scale">Noise Scale: {noiseScale.toFixed(3)}</Label>
                <Slider
                  id="noise-scale"
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  value={[noiseScale]}
                  onValueChange={(val) => setNoiseScale(val[0])}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="time-step">Time Step: {timeStep.toFixed(3)}</Label>
                <Slider
                  id="time-step"
                  min={0.001}
                  max={0.1}
                  step={0.001}
                  value={[timeStep]}
                  onValueChange={(val) => setTimeStep(val[0])}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="stereographic-projection"
                  checked={enableStereographic}
                  onCheckedChange={setEnableStereographic}
                />
                <Label htmlFor="stereographic-projection">Enable Stereographic Projection</Label>
              </div>

              {enableStereographic && (
                <div className="space-y-2">
                  <Label htmlFor="stereographic-perspective">Projection Type</Label>
                  <Select value={stereographicPerspective} onValueChange={setStereographicPerspective}>
                    <SelectTrigger id="stereographic-perspective">
                      <SelectValue placeholder="Select perspective" />
                    </SelectTrigger>
                    <SelectContent>
                      {stereographicOptions.map((o) => (
                        <SelectItem key={o.value} value={o.value}>
                          {o.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <Button onClick={generateArt} className="w-full" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate Mathematical Art
              </Button>
            </TabsContent>

            <TabsContent value="ai-art" className="space-y-6 pt-4">
              <div className="space-y-2">
                <Label htmlFor="ai-prompt">AI Art Prompt</Label>
                <Textarea
                  id="ai-prompt"
                  placeholder="Describe the AI art you want to generate..."
                  value={aiArtPrompt}
                  onChange={(e) => setAiArtPrompt(e.target.value)}
                  rows={5}
                />
              </div>
              <Button onClick={enhancePrompt} className="w-full" disabled={aiLoading}>
                {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enhance Prompt <Sparkles className="ml-2 h-4 w-4" />
              </Button>
              <Button onClick={generateAiArt} className="w-full" disabled={aiLoading}>
                {aiLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Generate AI Art
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Middle Panel: Art Display */}
      <Card className="w-full lg:w-1/2 flex flex-col">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Generated Art
          </CardTitle>
          <CardDescription>Your unique mathematical or AI-generated artwork.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col items-center justify-center p-4">
          <AspectRatio
            ratio={1 / 1}
            className="w-full max-w-xl bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden"
          >
            {loading || aiLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-12 w-12 animate-spin text-gray-500" />
              </div>
            ) : imageUrl ? (
              <img src={imageUrl || "/placeholder.png"} alt="Generated Art" className="w-full h-full object-contain" />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">No image generated yet.</div>
            )}
            <canvas ref={canvasRef} width={1024} height={1024} className="hidden" />
          </AspectRatio>
          {imageUrl && (
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={() => downloadImage(imageUrl, "flowsketch_art.png")} disabled={upscaleLoading}>
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={upscaleImage} disabled={upscaleLoading}>
                {upscaleLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                <ImageUp className="mr-2 h-4 w-4" /> Upscale
              </Button>
              {supabase && (
                <Button onClick={saveToGallery} disabled={loading}>
                  <Save className="mr-2 h-4 w-4" /> Save to Gallery
                </Button>
              )}
            </div>
          )}
          {currentPrompt && (
            <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
              <p className="font-semibold">Current Prompt:</p>
              <p className="italic">{currentPrompt}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Right Panel: Gallery */}
      <Card className="w-full lg:w-1/4 flex-shrink-0">
        <CardHeader>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Art Gallery
          </CardTitle>
          <CardDescription>Your saved masterpieces.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {supabase ? (
            <ScrollArea className="h-[600px] w-full">
              {galleryLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
                </div>
              ) : galleryItems.length === 0 ? (
                <div className="p-4 text-center text-muted-foreground">No art saved yet.</div>
              ) : (
                <div className="grid grid-cols-1 gap-4 p-4">
                  {galleryItems.map((item) => (
                    <Card key={item.id} className="relative group">
                      <img
                        src={item.image_url || "/placeholder.png"}
                        alt={item.prompt || "Gallery Art"}
                        className="w-full h-auto rounded-md object-cover cursor-pointer"
                        onClick={() => loadFromGallery(item)}
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                        <Button variant="secondary" size="sm" onClick={() => loadFromGallery(item)}>
                          Load
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="ml-2"
                          onClick={() => deleteFromGallery(item.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <CardContent className="p-2 text-xs text-muted-foreground">
                        <p className="truncate">{item.prompt}</p>
                        <p>{new Date(item.created_at).toLocaleDateString()}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </ScrollArea>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              Supabase environment variables are not set. Gallery features are disabled.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
