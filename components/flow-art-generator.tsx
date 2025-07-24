"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { toast } from "@/components/ui/use-toast"
import { generateFlowField } from "@/lib/flow-model"
import { drawFlowField } from "@/lib/plot-utils"
import { supabase } from "@/lib/supabase"

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
    \
