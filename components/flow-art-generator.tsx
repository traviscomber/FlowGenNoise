"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import { Vector3, Color, type Mesh } from "three"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { DATASETS, COLOR_SCHEMES, SCENARIOS, type FlowField } from "@/lib/flow-model"
import { getSupabaseClient } from "@/lib/supabase"
import { Download, Expand, ImageIcon, Trash2, Sparkles, Loader2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { AspectRatio } from "@/components/ui/aspect-ratio"
import Image from "next/image"
import { Toaster } from "@/components/ui/toaster"

interface ParticleProps {
  flow: FlowField
  initialPosition: Vector3
  noiseStrength: number
  color: Color
  stereographic: boolean
  speed: number
}

const Particle = ({ flow, initialPosition, noiseStrength, color, stereographic, speed }: ParticleProps) => {
  const ref = useRef<Mesh>(null!)
  const position = useRef(initialPosition.clone())
  const { invalidate } = useThree()

  useFrame((state, delta) => {
    if (!ref.current) return

    const dt = delta * speed
    const currentPos = position.current.clone()
    const flowVector = flow(currentPos).multiplyScalar(dt)

    // Add random noise
    const noise = new Vector3(
      (Math.random() - 0.5) * 2 * noiseStrength,
      (Math.random() - 0.5) * 2 * noiseStrength,
      (Math.random() - 0.5) * 2 * noiseStrength,
    ).multiplyScalar(dt)

    position.current.add(flowVector).add(noise)

    if (stereographic) {
      // Stereographic projection from 3D to 2D plane (z=0)
      // P' = (P_x / (1 - P_z), P_y / (1 - P_z), 0) assuming projection from (0,0,1)
      const sx = position.current.x / (1 - position.current.z)
      const sy = position.current.y / (1 - position.current.z)
      ref.current.position.set(sx, sy, 0)
    } else {
      ref.current.position.copy(position.current)
    }

    ref.current.material.color.copy(color)
    invalidate()
  })

  return (
    <mesh ref={ref}>
      <sphereGeometry args={[0.01, 8, 8]} />
      <meshBasicMaterial />
    </mesh>
  )
}

interface FlowFieldSceneProps {
  selectedDataset: (typeof DATASETS)[0]
  selectedColorScheme: (typeof COLOR_SCHEMES)[0]
  selectedScenario: (typeof SCENARIOS)[0]
  numParticles: number
  particleSpeed: number
  lineLength: number
}

const FlowFieldScene = ({
  selectedDataset,
  selectedColorScheme,
  selectedScenario,
  numParticles,
  particleSpeed,
  lineLength,
}: FlowFieldSceneProps) => {
  const particles = useRef<Vector3[]>([])
  const colors = useRef<Color[]>([])
  const { invalidate } = useThree()

  useEffect(() => {
    particles.current = Array.from({ length: numParticles }, () => selectedScenario.initialPosition.clone())
    colors.current = Array.from({ length: numParticles }, (_, i) => {
      const colorIndex = Math.floor((i / numParticles) * selectedColorScheme.colors.length)
      return new Color(selectedColorScheme.colors[colorIndex])
    })
    invalidate()
  }, [numParticles, selectedDataset, selectedColorScheme, selectedScenario, invalidate])

  useFrame((state, delta) => {
    const dt = delta * particleSpeed
    const newPositions: Vector3[] = []

    for (let i = 0; i < particles.current.length; i++) {
      const currentPos = particles.current[i].clone()
      const flowVector = selectedDataset.flow(currentPos, selectedDataset.params).multiplyScalar(dt)

      const noise = new Vector3(
        (Math.random() - 0.5) * 2 * selectedScenario.noiseStrength,
        (Math.random() - 0.5) * 2 * selectedScenario.noiseStrength,
        (Math.random() - 0.5) * 2 * selectedScenario.noiseStrength,
      ).multiplyScalar(dt)

      const nextPos = currentPos.add(flowVector).add(noise)
      newPositions.push(nextPos)
    }
    particles.current = newPositions
    invalidate()
  })

  const lines = particles.current.flatMap((p, i) => {
    const prevP = particles.current[Math.max(0, i - 1)] || p
    const currentP = p

    if (selectedScenario.stereographic) {
      const sx1 = prevP.x / (1 - prevP.z)
      const sy1 = prevP.y / (1 - prevP.z)
      const sx2 = currentP.x / (1 - currentP.z)
      const sy2 = currentP.y / (1 - currentP.z)
      return [new Vector3(sx1, sy1, 0), new Vector3(sx2, sy2, 0)]
    } else {
      return [prevP, currentP]
    }
  })

  return (
    <lineSegments>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={new Float32Array(lines.flatMap((v) => v.toArray()))}
          itemSize={3}
          count={lines.length}
        />
      </bufferGeometry>
      <lineBasicMaterial attach="material" vertexColors={false} color={selectedColorScheme.colors[0]} />
    </lineSegments>
  )
}

export default function FlowArtGenerator() {
  const { toast } = useToast()
  const [selectedDataset, setSelectedDataset] = useState(DATASETS[0])
  const [selectedColorScheme, setSelectedColorScheme] = useState(COLOR_SCHEMES[0])
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])
  const [numParticles, setNumParticles] = useState(10000)
  const [particleSpeed, setParticleSpeed] = useState(0.01)
  const [lineLength, setLineLength] = useState(0.05)
  const [prompt, setPrompt] = useState("")
  const [enhancedPrompt, setEnhancedPrompt] = useState("")
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)
  const [aiArtUrl, setAiArtUrl] = useState<string | null>(null)
  const [isUpscaling, setIsUpscaling] = useState(false)
  const [gallery, setGallery] = useState<any[]>([])
  const [isGalleryLoading, setIsGalleryLoading] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPromptEnhancing, setIsPromptEnhancing] = useState(false)

  const supabase = getSupabaseClient()

  const loadGallery = useCallback(async () => {
    if (!supabase) {
      toast({
        title: "Supabase Not Configured",
        description: "Gallery features are disabled. Please set up Supabase environment variables.",
        variant: "destructive",
      })
      return
    }
    setIsGalleryLoading(true)
    try {
      const { data, error } = await supabase.from("artworks").select("*").order("created_at", { ascending: false })
      if (error) throw error
      setGallery(data || [])
    } catch (error: any) {
      toast({
        title: "Error loading gallery",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGalleryLoading(false)
    }
  }, [supabase, toast])

  useEffect(() => {
    loadGallery()
  }, [loadGallery])

  const handleDownload = useCallback(() => {
    if (canvasRef.current) {
      const dataURL = canvasRef.current.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = dataURL
      link.download = "flowsketch-art.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Image Downloaded",
        description: "Your mathematical art has been downloaded!",
      })
    }
  }, [toast])

  const handleUpscale = useCallback(async () => {
    if (!canvasRef.current) {
      toast({
        title: "Error",
        description: "No image to upscale.",
        variant: "destructive",
      })
      return
    }

    setIsUpscaling(true)
    try {
      const dataURL = canvasRef.current.toDataURL("image/png")
      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: dataURL }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upscale image")
      }

      const { upscaledImage } = await response.json()
      const link = document.createElement("a")
      link.href = upscaledImage
      link.download = "flowsketch-art-upscaled.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast({
        title: "Image Upscaled",
        description: "Your art has been upscaled and downloaded!",
      })
    } catch (error: any) {
      toast({
        title: "Upscaling Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsUpscaling(false)
    }
  }, [toast])

  const handleGenerateAIArt = useCallback(async () => {
    setIsGeneratingAI(true)
    setAiArtUrl(null)
    try {
      const response = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: enhancedPrompt || prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate AI art")
      }

      const { imageUrl } = await response.json()
      setAiArtUrl(imageUrl)
      toast({
        title: "AI Art Generated",
        description: "Your AI-enhanced art is ready!",
      })
    } catch (error: any) {
      toast({
        title: "AI Art Generation Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingAI(false)
    }
  }, [prompt, enhancedPrompt, toast])

  const handleEnhancePrompt = useCallback(async () => {
    setIsPromptEnhancing(true)
    try {
      const response = await fetch("/api/enhance-prompt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to enhance prompt")
      }

      const { enhancedPrompt: newEnhancedPrompt } = await response.json()
      setEnhancedPrompt(newEnhancedPrompt)
      toast({
        title: "Prompt Enhanced",
        description: "Your prompt has been enhanced by AI.",
      })
    } catch (error: any) {
      toast({
        title: "Prompt Enhancement Failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsPromptEnhancing(false)
    }
  }, [prompt, toast])

  const handleSaveToGallery = useCallback(async () => {
    if (!supabase) {
      toast({
        title: "Supabase Not Configured",
        description: "Gallery features are disabled. Please set up Supabase environment variables.",
        variant: "destructive",
      })
      return
    }
    if (!canvasRef.current) {
      toast({
        title: "Error",
        description: "No image to save.",
        variant: "destructive",
      })
      return
    }

    const dataURL = canvasRef.current.toDataURL("image/png")
    const base64Image = dataURL.split(",")[1]
    const fileName = `artwork-${Date.now()}.png`

    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("artworks")
        .upload(fileName, decodeBase64(base64Image), {
          contentType: "image/png",
          upsert: false,
        })

      if (uploadError) throw uploadError

      const { data: publicUrlData } = supabase.storage.from("artworks").getPublicUrl(fileName)

      if (!publicUrlData || !publicUrlData.publicUrl) {
        throw new Error("Could not get public URL for the uploaded image.")
      }

      const { error: insertError } = await supabase.from("artworks").insert({
        image_url: publicUrlData.publicUrl,
        dataset: selectedDataset.name,
        color_scheme: selectedColorScheme.name,
        scenario: selectedScenario.name,
        parameters: JSON.stringify(selectedDataset.params),
        num_particles: numParticles,
        particle_speed: particleSpeed,
        line_length: lineLength,
        prompt: prompt,
        enhanced_prompt: enhancedPrompt,
      })

      if (insertError) throw insertError

      toast({
        title: "Saved to Gallery",
        description: "Your artwork has been saved to the gallery!",
      })
      loadGallery() // Reload gallery to show new artwork
    } catch (error: any) {
      toast({
        title: "Failed to Save",
        description: error.message,
        variant: "destructive",
      })
    }
  }, [
    supabase,
    selectedDataset,
    selectedColorScheme,
    selectedScenario,
    numParticles,
    particleSpeed,
    lineLength,
    prompt,
    enhancedPrompt,
    toast,
    loadGallery,
  ])

  const handleDeleteArtwork = useCallback(
    async (id: string, imageUrl: string) => {
      if (!supabase) {
        toast({
          title: "Supabase Not Configured",
          description: "Gallery features are disabled. Please set up Supabase environment variables.",
          variant: "destructive",
        })
        return
      }
      try {
        // Extract file name from URL
        const fileName = imageUrl.split("/").pop()
        if (!fileName) throw new Error("Could not extract file name from URL.")

        const { error: storageError } = await supabase.storage.from("artworks").remove([fileName])
        if (storageError) throw storageError

        const { error: dbError } = await supabase.from("artworks").delete().eq("id", id)
        if (dbError) throw dbError

        toast({
          title: "Artwork Deleted",
          description: "Artwork successfully removed from gallery.",
        })
        loadGallery()
      } catch (error: any) {
        toast({
          title: "Deletion Failed",
          description: error.message,
          variant: "destructive",
        })
      }
    },
    [supabase, toast, loadGallery],
  )

  // Helper to decode base64 to ArrayBuffer for Supabase storage
  const decodeBase64 = (base64: string) => {
    const binaryString = atob(base64)
    const len = binaryString.length
    const bytes = new Uint8Array(len)
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i)
    }
    return bytes.buffer
  }

  return (
    <div className="flex flex-col lg:flex-row h-full min-h-screen bg-gray-50 dark:bg-gray-950 text-gray-900 dark:text-gray-50">
      {/* Controls Panel */}
      <div className="w-full lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-800 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">FlowSketch</h1>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Dataset & Scenario</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="dataset-select" className="mb-2 block">
                Dataset
              </Label>
              <Select
                value={selectedDataset.name}
                onValueChange={(value) => setSelectedDataset(DATASETS.find((d) => d.name === value) || DATASETS[0])}
              >
                <SelectTrigger id="dataset-select">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  {DATASETS.map((dataset) => (
                    <SelectItem key={dataset.name} value={dataset.name}>
                      {dataset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedDataset.description}</p>
            </div>

            <div>
              <Label htmlFor="scenario-select" className="mb-2 block">
                Scenario
              </Label>
              <Select
                value={selectedScenario.name}
                onValueChange={(value) => setSelectedScenario(SCENARIOS.find((s) => s.name === value) || SCENARIOS[0])}
              >
                <SelectTrigger id="scenario-select">
                  <SelectValue placeholder="Select a scenario" />
                </SelectTrigger>
                <SelectContent>
                  {SCENARIOS.map((scenario) => (
                    <SelectItem key={scenario.name} value={scenario.name}>
                      {scenario.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{selectedScenario.description}</p>
            </div>

            <div>
              <Label htmlFor="color-scheme-select" className="mb-2 block">
                Color Scheme
              </Label>
              <Select
                value={selectedColorScheme.name}
                onValueChange={(value) =>
                  setSelectedColorScheme(COLOR_SCHEMES.find((c) => c.name === value) || COLOR_SCHEMES[0])
                }
              >
                <SelectTrigger id="color-scheme-select">
                  <SelectValue placeholder="Select a color scheme" />
                </SelectTrigger>
                <SelectContent>
                  {COLOR_SCHEMES.map((scheme) => (
                    <SelectItem key={scheme.name} value={scheme.name}>
                      <div className="flex items-center gap-2">
                        {scheme.name}
                        <div className="flex -space-x-1 overflow-hidden">
                          {scheme.colors.map((color, i) => (
                            <div
                              key={i}
                              className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-700"
                              style={{ backgroundColor: color }}
                            />
                          ))}
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="num-particles">Number of Particles: {numParticles}</Label>
              <Slider
                id="num-particles"
                min={1000}
                max={50000}
                step={1000}
                value={[numParticles]}
                onValueChange={([val]) => setNumParticles(val)}
              />
            </div>
            <div>
              <Label htmlFor="particle-speed">Particle Speed: {particleSpeed.toFixed(3)}</Label>
              <Slider
                id="particle-speed"
                min={0.001}
                max={0.1}
                step={0.001}
                value={[particleSpeed]}
                onValueChange={([val]) => setParticleSpeed(val)}
              />
            </div>
            <div>
              <Label htmlFor="line-length">Line Length: {lineLength.toFixed(2)}</Label>
              <Slider
                id="line-length"
                min={0.01}
                max={0.5}
                step={0.01}
                value={[lineLength]}
                onValueChange={([val]) => setLineLength(val)}
              />
            </div>
            {Object.entries(selectedDataset.params).map(([key, value]) => (
              <div key={key}>
                <Label htmlFor={`param-${key}`}>
                  {key}: {value.toFixed(3)}
                </Label>
                <Slider
                  id={`param-${key}`}
                  min={typeof value === "number" ? value * 0.5 : 0}
                  max={typeof value === "number" ? value * 1.5 : 100}
                  step={typeof value === "number" ? (value * 0.01 < 0.001 ? 0.001 : value * 0.01) : 1}
                  value={[value as number]}
                  onValueChange={([val]) =>
                    setSelectedDataset((prev) => ({
                      ...prev,
                      params: { ...prev.params, [key]: val },
                    }))
                  }
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>AI Art Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="prompt">Prompt for AI Art</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the AI art you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[80px]"
              />
            </div>
            <Button onClick={handleEnhancePrompt} disabled={!prompt || isPromptEnhancing} className="w-full">
              {isPromptEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Enhance Prompt
                </>
              )}
            </Button>
            {enhancedPrompt && (
              <div className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md text-sm">
                <p className="font-medium mb-1">Enhanced Prompt:</p>
                <p>{enhancedPrompt}</p>
              </div>
            )}
            <Button
              onClick={handleGenerateAIArt}
              disabled={isGeneratingAI || (!prompt && !enhancedPrompt)}
              className="w-full"
            >
              {isGeneratingAI ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating AI Art...
                </>
              ) : (
                <>
                  <ImageIcon className="mr-2 h-4 w-4" /> Generate AI Art
                </>
              )}
            </Button>
            {aiArtUrl && (
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Generated AI Art</h3>
                <AspectRatio ratio={1 / 1} className="bg-gray-200 dark:bg-gray-800 rounded-md overflow-hidden">
                  <Image src={aiArtUrl || "/placeholder.svg"} alt="Generated AI Art" fill className="object-cover" />
                </AspectRatio>
                <a href={aiArtUrl} download="ai-flowsketch-art.png" className="mt-2 block">
                  <Button className="w-full">
                    <Download className="mr-2 h-4 w-4" /> Download AI Art
                  </Button>
                </a>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Canvas and Gallery */}
      <div className="flex-1 flex flex-col p-6">
        <div className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden relative">
          <Canvas
            gl={{ preserveDrawingBuffer: true }}
            ref={canvasRef}
            className="w-full h-full"
            camera={{ position: [0, 0, 5], fov: 75 }}
          >
            <ambientLight intensity={0.5} />
            <pointLight position={[10, 10, 10]} />
            <FlowFieldScene
              selectedDataset={selectedDataset}
              selectedColorScheme={selectedColorScheme}
              selectedScenario={selectedScenario}
              numParticles={numParticles}
              particleSpeed={particleSpeed}
              lineLength={lineLength}
            />
            <OrbitControls />
            <PerspectiveCamera makeDefault position={[0, 0, 5]} />
          </Canvas>
          <div className="absolute bottom-4 left-4 flex gap-2">
            <Button onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" /> Download
            </Button>
            <Button onClick={handleUpscale} disabled={isUpscaling}>
              {isUpscaling ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Upscaling...
                </>
              ) : (
                <>
                  <Expand className="mr-2 h-4 w-4" /> Upscale
                </>
              )}
            </Button>
            <Button onClick={handleSaveToGallery} disabled={!supabase}>
              Save to Gallery
            </Button>
          </div>
        </div>

        {supabase && (
          <div className="mt-6">
            <h2 className="text-2xl font-bold mb-4">Your Gallery</h2>
            {isGalleryLoading ? (
              <div className="flex justify-center items-center h-32">
                <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
              </div>
            ) : gallery.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">
                No artworks in your gallery yet. Generate some art and save it!
              </p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {gallery.map((artwork) => (
                  <Card key={artwork.id} className="relative group">
                    <CardContent className="p-0">
                      <AspectRatio ratio={1 / 1}>
                        <Image
                          src={artwork.image_url || "/placeholder.svg"}
                          alt={`Artwork ${artwork.id}`}
                          fill
                          className="object-cover rounded-md"
                        />
                      </AspectRatio>
                    </CardContent>
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-md">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="secondary" size="sm" className="mr-2">
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl p-0">
                          <DialogHeader className="p-4 pb-0">
                            <DialogTitle>Artwork Details</DialogTitle>
                          </DialogHeader>
                          <div className="grid md:grid-cols-2 gap-4 p-4">
                            <div className="relative w-full h-96">
                              <Image
                                src={artwork.image_url || "/placeholder.svg"}
                                alt="Full Artwork"
                                fill
                                className="object-contain"
                              />
                            </div>
                            <div className="space-y-2 text-sm">
                              <p>
                                <strong>Dataset:</strong> {artwork.dataset}
                              </p>
                              <p>
                                <strong>Color Scheme:</strong> {artwork.color_scheme}
                              </p>
                              <p>
                                <strong>Scenario:</strong> {artwork.scenario}
                              </p>
                              <p>
                                <strong>Particles:</strong> {artwork.num_particles}
                              </p>
                              <p>
                                <strong>Speed:</strong> {artwork.particle_speed}
                              </p>
                              <p>
                                <strong>Line Length:</strong> {artwork.line_length}
                              </p>
                              {artwork.prompt && (
                                <p>
                                  <strong>Prompt:</strong> {artwork.prompt}
                                </p>
                              )}
                              {artwork.enhanced_prompt && (
                                <p>
                                  <strong>Enhanced Prompt:</strong> {artwork.enhanced_prompt}
                                </p>
                              )}
                              <p>
                                <strong>Generated At:</strong> {new Date(artwork.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteArtwork(artwork.id, artwork.image_url)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <Toaster />
    </div>
  )
}
