"use client"

import { AlertDescription } from "@/components/ui/alert"

import { AlertTitle } from "@/components/ui/alert"

import { Alert } from "@/components/ui/alert"

import { useState, useRef, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import {
  DATASETS,
  SCENARIOS,
  COLOR_SCHEMES,
  DEFAULT_FLOW_PARAMETERS,
  type FlowParameters,
  type GalleryItem,
} from "@/lib/flow-model"
import { drawFlowArt } from "@/lib/plot-utils"
import Image from "next/image"
import { Download, Trash2, RefreshCcw, Sparkles, ImageUp, GalleryHorizontal } from "lucide-react"

export default function FlowArtGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [parameters, setParameters] = useState<FlowParameters>(DEFAULT_FLOW_PARAMETERS)
  const [isLoading, setIsLoading] = useState(false)
  const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null)
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([])
  const [activeTab, setActiveTab] = useState("generate")
  const [aiPrompt, setAiPrompt] = useState("")
  const [aiArtPrompt, setAiArtPrompt] = useState("")
  const [aiArtImageUrl, setAiArtImageUrl] = useState<string | null>(null)
  const [isEnhancingPrompt, setIsEnhancingPrompt] = useState(false)
  const [isGeneratingAiArt, setIsGeneratingAiArt] = useState(false)

  const { toast } = useToast()

  const fetchGalleryItems = useCallback(async () => {
    if (!supabase) {
      console.warn("Supabase client not initialized. Cannot fetch gallery items.")
      return
    }
    try {
      const { data, error } = await supabase.from("gallery_items").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setGalleryItems(data || [])
    } catch (error: any) {
      console.error("Error fetching gallery items:", error.message)
      toast({
        title: "Error",
        description: `Failed to load gallery: ${error.message}`,
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchGalleryItems()
  }, [fetchGalleryItems])

  const generateArt = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas) return

    setIsLoading(true)
    setCurrentImageUrl(null) // Clear previous image

    try {
      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ parameters }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { data: artData } = await response.json()

      // Draw the art on the canvas
      drawFlowArt(canvas, artData, parameters.colorScheme, parameters.stereographic)
      setCurrentImageUrl(canvas.toDataURL("image/png")) // Get data URL for display

      toast({
        title: "Success",
        description: "Mathematical art generated!",
      })
    } catch (error: any) {
      console.error("Error generating art:", error)
      toast({
        title: "Error",
        description: `Failed to generate art: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [parameters, toast])

  const downloadImage = useCallback(() => {
    if (currentImageUrl) {
      const link = document.createElement("a")
      link.href = currentImageUrl
      link.download = `flowsketch-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Download Complete",
        description: "Your art has been downloaded.",
      })
    } else {
      toast({
        title: "No Image",
        description: "Generate an image first before downloading.",
        variant: "destructive",
      })
    }
  }, [currentImageUrl, toast])

  const upscaleCurrentImage = useCallback(async () => {
    if (!currentImageUrl) {
      toast({
        title: "No Image",
        description: "Generate an image first before upscaling.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: currentImageUrl }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { upscaledUrl } = await response.json()
      setCurrentImageUrl(upscaledUrl) // Update with upscaled image
      toast({
        title: "Upscale Complete",
        description: "Your art has been upscaled.",
      })
    } catch (error: any) {
      console.error("Error upscaling image:", error)
      toast({
        title: "Error",
        description: `Failed to upscale image: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentImageUrl, toast])

  const saveToGallery = useCallback(async () => {
    if (!currentImageUrl) {
      toast({
        title: "No Image",
        description: "Generate an image first before saving to gallery.",
        variant: "destructive",
      })
      return
    }
    if (!supabase) {
      toast({
        title: "Gallery Disabled",
        description: "Supabase is not configured. Cannot save to gallery.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    try {
      // Convert data URL to Blob for Supabase storage
      const response = await fetch(currentImageUrl)
      const blob = await response.blob()

      const fileExtension = currentImageUrl.split(";")[0].split("/")[1] // e.g., 'png'
      const fileName = `flowsketch-art-${Date.now()}.${fileExtension}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("gallery-images")
        .upload(fileName, blob, {
          cacheControl: "3600",
          upsert: false,
          contentType: blob.type,
        })

      if (uploadError) throw uploadError

      const publicUrl = supabase.storage.from("gallery-images").getPublicUrl(fileName).data.publicUrl

      const { error: insertError } = await supabase.from("gallery_items").insert({
        image_url: publicUrl,
        parameters: parameters,
        prompt: aiPrompt, // Save the prompt used for generation
        ai_enhanced_prompt: aiPrompt, // Assuming AI prompt is the final prompt
      })

      if (insertError) throw insertError

      toast({
        title: "Saved to Gallery",
        description: "Your art has been saved to the gallery.",
      })
      fetchGalleryItems() // Refresh gallery
    } catch (error: any) {
      console.error("Error saving to gallery:", error.message)
      toast({
        title: "Error",
        description: `Failed to save to gallery: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [currentImageUrl, parameters, aiPrompt, toast, fetchGalleryItems])

  const loadFromGallery = useCallback(
    (item: GalleryItem) => {
      setParameters(item.parameters)
      setCurrentImageUrl(item.image_url)
      setAiPrompt(item.ai_enhanced_prompt || item.prompt || "")
      setActiveTab("generate") // Switch back to generate tab to view
      toast({
        title: "Art Loaded",
        description: "Art loaded from gallery.",
      })
    },
    [toast],
  )

  const deleteFromGallery = useCallback(
    async (id: string, imageUrl: string) => {
      if (!supabase) {
        toast({
          title: "Gallery Disabled",
          description: "Supabase is not configured. Cannot delete from gallery.",
          variant: "destructive",
        })
        return
      }
      setIsLoading(true)
      try {
        // Extract file path from public URL
        const filePath = imageUrl.split("/gallery-images/")[1]

        const { error: storageError } = await supabase.storage.from("gallery-images").remove([filePath])

        if (storageError) throw storageError

        const { error: dbError } = await supabase.from("gallery_items").delete().eq("id", id)

        if (dbError) throw dbError

        toast({
          title: "Deleted",
          description: "Art deleted from gallery.",
        })
        fetchGalleryItems() // Refresh gallery
      } catch (error: any) {
        console.error("Error deleting from gallery:", error.message)
        toast({
          title: "Error",
          description: `Failed to delete art: ${error.message}`,
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    },
    [toast, fetchGalleryItems],
  )

  const enhancePrompt = useCallback(async () => {
    if (!aiPrompt) {
      toast({
        title: "No Prompt",
        description: "Please enter a prompt to enhance.",
        variant: "destructive",
      })
      return
    }
    setIsEnhancingPrompt(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiPrompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { enhancedPrompt } = await response.json()
      setAiPrompt(enhancedPrompt)
      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been enhanced by AI.",
      })
    } catch (error: any) {
      console.error("Error enhancing prompt:", error)
      toast({
        title: "Error",
        description: `Failed to enhance prompt: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsEnhancingPrompt(false)
    }
  }, [aiPrompt, toast])

  const generateAiArt = useCallback(async () => {
    if (!aiArtPrompt) {
      toast({
        title: "No AI Art Prompt",
        description: "Please enter a prompt for AI art generation.",
        variant: "destructive",
      })
      return
    }
    setIsGeneratingAiArt(true)
    setAiArtImageUrl(null) // Clear previous AI art image

    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: aiArtPrompt }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const { imageUrl } = await response.json()
      setAiArtImageUrl(imageUrl)
      toast({
        title: "AI Art Generated",
        description: "Your AI art has been created.",
      })
    } catch (error: any) {
      console.error("Error generating AI art:", error)
      toast({
        title: "Error",
        description: `Failed to generate AI art: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAiArt(false)
    }
  }, [aiArtPrompt, toast])

  // Initial art generation on component mount
  useEffect(() => {
    generateArt()
  }, [generateArt])

  return (
    <div className="flex flex-col lg:flex-row gap-6 w-full max-w-6xl mx-auto p-4">
      {/* Left Panel: Controls */}
      <Card className="w-full lg:w-1/3 flex flex-col">
        <CardHeader>
          <CardTitle>FlowSketch Controls</CardTitle>
          <CardDescription>Adjust parameters to generate unique mathematical art.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-6 overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="dataset">Dataset</Label>
            <Select
              value={parameters.dataset}
              onValueChange={(value) => setParameters((prev) => ({ ...prev, dataset: value }))}
            >
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
            <Select
              value={parameters.scenario}
              onValueChange={(value) => setParameters((prev) => ({ ...prev, scenario: value }))}
            >
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
            <Label htmlFor="colorScheme">Color Scheme</Label>
            <Select
              value={parameters.colorScheme}
              onValueChange={(value) => setParameters((prev) => ({ ...prev, colorScheme: value }))}
            >
              <SelectTrigger id="colorScheme">
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
            <Label htmlFor="noise">Noise ({parameters.noise.toFixed(2)})</Label>
            <Slider
              id="noise"
              min={0}
              max={1}
              step={0.01}
              value={[parameters.noise]}
              onValueChange={(val) => setParameters((prev) => ({ ...prev, noise: val[0] }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="samples">Samples ({parameters.samples.toLocaleString()})</Label>
            <Slider
              id="samples"
              min={10000}
              max={1000000}
              step={10000}
              value={[parameters.samples]}
              onValueChange={(val) => setParameters((prev) => ({ ...prev, samples: val[0] }))}
            />
          </div>

          <div className="flex items-center justify-between space-x-2">
            <Label htmlFor="stereographic">Stereographic Projection</Label>
            <Switch
              id="stereographic"
              checked={parameters.stereographic}
              onCheckedChange={(checked) => setParameters((prev) => ({ ...prev, stereographic: checked }))}
            />
          </div>

          <Button onClick={generateArt} disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Art"}
            <RefreshCcw className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Right Panel: Art Display & AI/Gallery Tabs */}
      <Card className="w-full lg:w-2/3 flex flex-col">
        <CardHeader>
          <CardTitle>Generated Art</CardTitle>
          <CardDescription>View your mathematical art and explore AI features or your gallery.</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow flex flex-col space-y-4">
          <div className="relative w-full aspect-[1/1] bg-muted rounded-md overflow-hidden flex items-center justify-center">
            {isLoading ? (
              <div className="text-muted-foreground">Loading art...</div>
            ) : currentImageUrl ? (
              <canvas
                ref={canvasRef}
                width={500} // Fixed width for generation
                height={500} // Fixed height for generation
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }} // For sharp pixel art
              />
            ) : (
              <div className="text-muted-foreground">No art generated yet.</div>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            <Button onClick={downloadImage} disabled={!currentImageUrl || isLoading} variant="outline">
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={upscaleCurrentImage} disabled={!currentImageUrl || isLoading} variant="outline">
              <ImageUp className="mr-2 h-4 w-4" /> Upscale
            </Button>
            {supabase && (
              <Button onClick={saveToGallery} disabled={!currentImageUrl || isLoading} variant="outline">
                <GalleryHorizontal className="mr-2 h-4 w-4" /> Save to Gallery
              </Button>
            )}
          </div>

          <Separator className="my-4" />

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="ai">AI Tools</TabsTrigger>
              <TabsTrigger value="gallery">Gallery</TabsTrigger>
            </TabsList>
            <TabsContent value="ai" className="mt-4 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Enhance Prompt</CardTitle>
                  <CardDescription>Use AI to make your art prompts more descriptive.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your art prompt here..."
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    rows={3}
                    disabled={isEnhancingPrompt}
                  />
                  <Button onClick={enhancePrompt} disabled={isEnhancingPrompt || !aiPrompt}>
                    {isEnhancingPrompt ? "Enhancing..." : "Enhance Prompt"}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Generate AI Art</CardTitle>
                  <CardDescription>Create art from a text prompt using a powerful AI model.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Textarea
                    placeholder="Enter your AI art prompt here..."
                    value={aiArtPrompt}
                    onChange={(e) => setAiArtPrompt(e.target.value)}
                    rows={3}
                    disabled={isGeneratingAiArt}
                  />
                  <Button onClick={generateAiArt} disabled={isGeneratingAiArt || !aiArtPrompt}>
                    {isGeneratingAiArt ? "Generating..." : "Generate AI Art"}
                    <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                  {aiArtImageUrl && (
                    <div className="mt-4 relative w-full aspect-[1/1] bg-muted rounded-md overflow-hidden flex items-center justify-center">
                      <Image
                        src={aiArtImageUrl || "/placeholder.png"}
                        alt="Generated AI Art"
                        layout="fill"
                        objectFit="contain"
                        className="rounded-md"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="gallery" className="mt-4 space-y-4">
              {supabase ? (
                galleryItems.length === 0 ? (
                  <p className="text-center text-muted-foreground">No items in gallery. Generate and save some art!</p>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-h-[400px] overflow-y-auto p-2">
                    {galleryItems.map((item) => (
                      <Card key={item.id} className="relative group cursor-pointer overflow-hidden">
                        <Image
                          src={item.image_url || "/placeholder.png"}
                          alt={`Gallery Art ${item.id}`}
                          width={200}
                          height={200}
                          className="w-full h-auto object-cover rounded-md"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="flex flex-col gap-2">
                            <Button variant="secondary" size="sm" onClick={() => loadFromGallery(item)}>
                              Load
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => deleteFromGallery(item.id, item.image_url)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )
              ) : (
                <Alert variant="destructive">
                  <Sparkles className="h-4 w-4" />
                  <AlertTitle>Supabase Not Configured</AlertTitle>
                  <AlertDescription>
                    Gallery features are disabled because Supabase environment variables are missing. Please set
                    `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
