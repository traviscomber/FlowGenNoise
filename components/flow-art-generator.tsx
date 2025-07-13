"use client"

import type React from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"
import {
  Shuffle,
  Download,
  ImageIcon,
  Sparkles,
  Cloud,
  UploadCloud,
  CheckCircle,
  Loader2,
  Info,
  RefreshCcw,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ImagePlus,
} from "lucide-react"
import { generateFlowArt, generateAIArt, type FlowArtSettings } from "@/lib/flow-model"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { CloudSync, type CloudSyncStatus, type SyncConflict } from "@/lib/cloud-sync"
import { supabase } from "@/lib/supabase"

// Constants for datasets and scenarios
const DATASETS = ["mandelbrot", "julia", "sierpinski", "barnsley", "newton"]
const SCENARIOS = {
  none: "None",
  "abstract-patterns": "Abstract Patterns",
  "organic-forms": "Organic Forms",
  "futuristic-landscapes": "Futuristic Landscapes",
  "celestial-bodies": "Celestial Bodies",
  "geometric-abstractions": "Geometric Abstractions",
}
const COLOR_SCHEMES = ["plasma", "viridis", "cividis", "magma", "inferno", "twilight", "hsv", "rainbow", "grayscale"]

export function FlowArtGenerator() {
  const { toast } = useToast()
  const [settings, setSettings] = useState<FlowArtSettings>({
    dataset: "mandelbrot",
    scenario: "none",
    colorScheme: "plasma",
    seed: Math.floor(Math.random() * 100000),
    samples: 1000,
    noise: 0.01,
    generationMode: "svg", // Default to SVG
    upscale: false,
  })
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [upscaleProgress, setUpscaleProgress] = useState(0)
  const [upscaling, setUpscaling] = useState(false)
  const [currentImageId, setCurrentImageId] = useState<string | null>(null)
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>(CloudSync.getStatus())
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState({ email: "", password: "", displayName: "" })
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn")
  const [authLoading, setAuthLoading] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)
  const [syncConflicts, setSyncConflicts] = useState<SyncConflict[]>([])
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null)
  const [prompt, setPrompt] = useState("")

  /* load the current user once and keep it updated */
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUser(data.user ?? null))

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const listener = (status: CloudSyncStatus) => {
      setCloudSyncStatus(status)
    }
    CloudSync.addStatusListener(listener)
    CloudSync.initializeAuth() // Initialize auth state on component mount
    return () => CloudSync.removeStatusListener(listener)
  }, [])

  useEffect(() => {
    // Attempt full sync when authenticated and sync is enabled
    if (cloudSyncStatus.isAuthenticated && cloudSyncStatus.isEnabled && !cloudSyncStatus.isSyncing) {
      handleFullSync()
    }
  }, [cloudSyncStatus.isAuthenticated, cloudSyncStatus.isEnabled])

  const handleGenerate = async () => {
    setIsLoading(true)
    setProgress(0)
    setUpscaling(false)
    setAuthError(null) // Clear auth error on new generation attempt

    try {
      let imageUrl: string
      let filename: string
      let finalSettings = { ...settings }

      if (settings.generationMode === "svg") {
        imageUrl = generateFlowArt(finalSettings, (p) => setProgress(p))
        filename = `flowsketch-${finalSettings.dataset}-${Date.now()}.svg`
      } else {
        // AI generation
        toast({
          title: "Generating AI Art...",
          description: "This may take a moment. Please do not close the tab.",
          duration: 5000,
        })
        const aiResult = await generateAIArt(finalSettings, (p) => setProgress(p))
        imageUrl = aiResult.imageUrl
        filename = aiResult.filename
        finalSettings = aiResult.settings // Use settings returned by AI model (e.g., actual seed used)
      }

      setGeneratedImageUrl(imageUrl)
      setProgress(100)

      const newImage: GalleryImage = {
        id: crypto.randomUUID(),
        imageUrl,
        metadata: {
          ...finalSettings,
          createdAt: Date.now(),
          filename,
          fileSize: 0, // Will be updated after upload or estimated
        },
        isFavorite: false,
        tags: [],
      }
      setCurrentImageId(newImage.id)

      // Auto-upload to cloud if enabled
      const uploadResult = await CloudSync.autoUploadNewGeneration(newImage, (p) => setUpscaleProgress(p))
      if (uploadResult.success && uploadResult.cloudImage) {
        GalleryStorage.saveImage(uploadResult.cloudImage) // Save cloud version to local gallery
        toast({
          title: "Art Generated & Synced!",
          description: "Your new artwork has been saved to your gallery and synced to the cloud.",
          variant: "success",
        })
      } else {
        GalleryStorage.saveImage(newImage) // Save local version
        toast({
          title: "Art Generated!",
          description: "Your new artwork has been saved to your local gallery.",
          variant: "success",
        })
      }
    } catch (error: any) {
      console.error("Generation failed:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "An unexpected error occurred during art generation.",
        variant: "destructive",
      })
      setGeneratedImageUrl(null)
    } finally {
      setIsLoading(false)
      setProgress(0)
      setUpscaleProgress(0)
      setUpscaling(false)
    }
  }

  const handleUpscale = async () => {
    if (!generatedImageUrl || !currentImageId) return

    setUpscaling(true)
    setUpscaleProgress(0)
    toast({
      title: "Upscaling Image...",
      description: "This may take a moment. Please do not close the tab.",
      duration: 5000,
    })

    try {
      const imageToUpscale = GalleryStorage.getGallery().find((img) => img.id === currentImageId)
      if (!imageToUpscale) {
        throw new Error("Image not found in gallery for upscaling.")
      }

      const response = await fetch("/api/upscale-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ imageUrl: imageToUpscale.imageUrl }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to upscale image.")
      }

      const { upscaledImageUrl } = await response.json()

      // Update the existing image in gallery with the upscaled URL
      const updatedImage: GalleryImage = {
        ...imageToUpscale,
        imageUrl: upscaledImageUrl,
        metadata: {
          ...imageToUpscale.metadata,
          filename: imageToUpscale.metadata.filename.replace(/\.(svg|png)$/, "-upscaled.png"),
          fileSize: 0, // Reset, will be updated on re-upload
        },
      }

      // Re-upload the upscaled image to cloud if it was cloud-stored
      if (updatedImage.metadata.cloudStored) {
        const uploadResult = await CloudSync.uploadImageFullResolution(updatedImage, (p) => setUpscaleProgress(p))
        if (uploadResult.success && uploadResult.cloudImage) {
          GalleryStorage.saveImage(uploadResult.cloudImage)
          toast({
            title: "Image Upscaled & Synced!",
            description: "The upscaled image has been saved and synced to the cloud.",
            variant: "success",
          })
        } else {
          GalleryStorage.saveImage(updatedImage)
          toast({
            title: "Image Upscaled!",
            description: "The upscaled image has been saved to your local gallery.",
            variant: "success",
          })
        }
      } else {
        GalleryStorage.saveImage(updatedImage)
        toast({
          title: "Image Upscaled!",
          description: "The upscaled image has been saved to your local gallery.",
          variant: "success",
        })
      }

      setGeneratedImageUrl(upscaledImageUrl)
    } catch (error: any) {
      console.error("Upscaling failed:", error)
      toast({
        title: "Upscaling Failed",
        description: error.message || "An unexpected error occurred during upscaling.",
        variant: "destructive",
      })
    } finally {
      setUpscaling(false)
      setUpscaleProgress(0)
    }
  }

  const handleRandomize = () => {
    const randomDataset = DATASETS[Math.floor(Math.random() * DATASETS.length)]
    const randomColorScheme = COLOR_SCHEMES[Math.floor(Math.random() * COLOR_SCHEMES.length)]
    const randomSeed = Math.floor(Math.random() * 100000)
    const randomSamples = Math.floor(Math.random() * (2000 - 500 + 1)) + 500 // 500-2000
    const randomNoise = Number.parseFloat((Math.random() * 0.05).toFixed(3)) // 0-0.05

    setSettings((prev) => ({
      ...prev,
      dataset: randomDataset,
      colorScheme: randomColorScheme,
      seed: randomSeed,
      samples: randomSamples,
      noise: randomNoise,
      scenario:
        prev.generationMode === "ai"
          ? Object.keys(SCENARIOS)[Math.floor(Math.random() * Object.keys(SCENARIOS).length)]
          : "none",
    }))
  }

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)
    setAuthError(null)

    let result: { success: boolean; error?: string }

    if (authMode === "signIn") {
      result = await CloudSync.signInWithEmail(authForm.email, authForm.password)
    } else {
      result = await CloudSync.signUpWithEmail(authForm.email, authForm.password, authForm.displayName)
    }

    if (result.success) {
      toast({
        title: `Successfully ${authMode === "signIn" ? "signed in" : "signed up"}!`,
        description: "Cloud sync is now active.",
        variant: "success",
      })
      // Clear form after successful auth
      setAuthForm({ email: "", password: "", displayName: "" })
    } else {
      setAuthError(result.error || "Authentication failed.")
      toast({
        title: "Authentication Failed",
        description: result.error || "Please check your credentials.",
        variant: "destructive",
      })
    }
    setAuthLoading(false)
  }

  const handleSignOut = async () => {
    await CloudSync.signOut()
    toast({
      title: "Signed Out",
      description: "Cloud sync has been disabled.",
      variant: "default",
    })
  }

  const handleToggleSync = async (checked: boolean) => {
    if (checked) {
      const result = await CloudSync.enableSync()
      if (result.success) {
        toast({
          title: "Cloud Sync Enabled",
          description: "Your gallery will now sync with the cloud.",
          variant: "success",
        })
      } else {
        toast({
          title: "Failed to Enable Sync",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }
    } else {
      await CloudSync.disableSync()
      toast({
        title: "Cloud Sync Disabled",
        description: "Your gallery will no longer sync with the cloud.",
        variant: "default",
      })
    }
  }

  const handleFullSync = async () => {
    if (cloudSyncStatus.isSyncing) return
    toast({
      title: "Initiating Full Sync...",
      description: "Comparing local and cloud galleries.",
      duration: 3000,
    })
    const result = await CloudSync.performFullSync()
    if (result.success) {
      if (result.conflicts.length > 0) {
        setSyncConflicts(result.conflicts)
        toast({
          title: "Sync Complete with Conflicts",
          description: `${result.conflicts.length} conflicts found. Please resolve them.`,
          variant: "warning",
          duration: 5000,
        })
      } else {
        toast({
          title: "Full Sync Complete!",
          description: "Your gallery is now up-to-date.",
          variant: "success",
        })
      }
    } else {
      toast({
        title: "Full Sync Failed",
        description: result.error || "An error occurred during sync.",
        variant: "destructive",
      })
    }
  }

  const handleResolveConflict = async (conflict: SyncConflict, resolution: "keep_local" | "keep_cloud") => {
    await CloudSync.resolveConflict(conflict, resolution)
    setSyncConflicts((prev) => prev.filter((c) => c.localImage.id !== conflict.localImage.id))
    toast({
      title: "Conflict Resolved",
      description: `Image ${conflict.localImage.metadata.filename} resolved.`,
      variant: "default",
    })
    // After resolving, trigger a re-load of the gallery to reflect changes
    // This is handled by the CloudSyncService listener, but a manual trigger might be good for immediate UI update
    // For now, rely on the listener.
  }

  const handleDownloadImage = (imageUrl: string, type: "svg" | "png") => {
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `flowsketch-art-${Date.now()}.${type}`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleAIImageGenerate = async () => {
    if (!prompt.trim()) {
      toast({ title: "Prompt required", variant: "destructive" })
      return
    }

    setIsLoading(true)
    try {
      const res = await fetch("/api/generate-ai-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        throw new Error(err?.error || "Failed to generate image")
      }

      const { imageUrl } = (await res.json()) as { imageUrl: string }
      // Bubble the new image up to any listeners (e.g. <Gallery />)
      window.dispatchEvent(new CustomEvent("new-image", { detail: imageUrl }))
      setGeneratedImageUrl(imageUrl)
    } catch (err: any) {
      toast({ title: err.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <TooltipProvider>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            FlowSketch Art Generator
          </CardTitle>
          <CardDescription>Generate beautiful mathematical and AI-enhanced artworks.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Left Panel: Settings */}
          <div className="space-y-6">
            <Tabs
              value={settings.generationMode}
              onValueChange={(value) =>
                setSettings((prev) => ({
                  ...prev,
                  generationMode: value as "svg" | "ai",
                  scenario: value === "svg" ? "none" : prev.scenario, // Reset scenario for SVG
                }))
              }
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="svg">
                  <ImageIcon className="h-4 w-4 mr-2" />
                  Mathematical Art
                </TabsTrigger>
                <TabsTrigger value="ai">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Enhanced
                </TabsTrigger>
              </TabsList>
              <TabsContent value="svg" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset">Dataset</Label>
                  <Select
                    value={settings.dataset}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, dataset: value }))}
                  >
                    <SelectTrigger id="dataset">
                      <SelectValue placeholder="Select a dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATASETS.map((dataset) => (
                        <SelectItem key={dataset} value={dataset}>
                          {dataset.charAt(0).toUpperCase() + dataset.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-scheme">Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger id="color-scheme">
                      <SelectValue placeholder="Select a color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEMES.map((scheme) => (
                        <SelectItem key={scheme} value={scheme}>
                          {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="ai" className="mt-4 space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="dataset-ai">Base Dataset</Label>
                  <Select
                    value={settings.dataset}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, dataset: value }))}
                  >
                    <SelectTrigger id="dataset-ai">
                      <SelectValue placeholder="Select a base dataset" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATASETS.map((dataset) => (
                        <SelectItem key={dataset} value={dataset}>
                          {dataset.charAt(0).toUpperCase() + dataset.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scenario">Creative Scenario</Label>
                  <Select
                    value={settings.scenario}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, scenario: value }))}
                  >
                    <SelectTrigger id="scenario">
                      <SelectValue placeholder="Select a creative scenario" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SCENARIOS).map(([key, value]) => (
                        <SelectItem key={key} value={key}>
                          {value}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="color-scheme-ai">Color Scheme</Label>
                  <Select
                    value={settings.colorScheme}
                    onValueChange={(value) => setSettings((prev) => ({ ...prev, colorScheme: value }))}
                  >
                    <SelectTrigger id="color-scheme-ai">
                      <SelectValue placeholder="Select a color scheme" />
                    </SelectTrigger>
                    <SelectContent>
                      {COLOR_SCHEMES.map((scheme) => (
                        <SelectItem key={scheme} value={scheme}>
                          {scheme.charAt(0).toUpperCase() + scheme.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="upscale">Upscale to 4K (AI Only)</Label>
                  <Switch
                    id="upscale"
                    checked={settings.upscale}
                    onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, upscale: checked }))}
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="space-y-2">
              <Label htmlFor="seed">Seed: {settings.seed}</Label>
              <Input
                id="seed"
                type="number"
                value={settings.seed}
                onChange={(e) => setSettings((prev) => ({ ...prev, seed: Number.parseInt(e.target.value) || 0 }))}
              />
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
              <Label htmlFor="noise">Noise: {settings.noise.toFixed(3)}</Label>
              <Slider
                id="noise"
                min={0}
                max={0.1}
                step={0.001}
                value={[settings.noise]}
                onValueChange={(value) => setSettings((prev) => ({ ...prev, noise: value[0] }))}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleRandomize} variant="outline" className="flex-1 bg-transparent">
                <Shuffle className="h-4 w-4 mr-2" />
                Randomize Settings
              </Button>
              <Button onClick={handleGenerate} className="flex-1" disabled={isLoading || upscaling}>
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Art
                  </>
                )}
              </Button>
            </div>
            {(isLoading || upscaling) && (
              <Progress value={isLoading ? progress : upscaleProgress} className="w-full mt-4" />
            )}
          </div>

          {/* Right Panel: Generated Image & Cloud Sync */}
          <div className="space-y-6">
            <Card className="h-64 flex items-center justify-center bg-muted relative overflow-hidden">
              {generatedImageUrl ? (
                <img
                  src={generatedImageUrl || "/placeholder.svg"}
                  alt="Generated Art"
                  className="object-contain h-full w-full"
                />
              ) : (
                <div className="text-muted-foreground text-center">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2" />
                  <p>Your art will appear here</p>
                </div>
              )}
              {generatedImageUrl && (
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={() =>
                          handleDownloadImage(generatedImageUrl, settings.generationMode === "svg" ? "svg" : "png")
                        }
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download Image</TooltipContent>
                  </Tooltip>
                  {settings.generationMode === "ai" && !upscaling && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button size="icon" onClick={handleUpscale} disabled={upscaling}>
                          {upscaling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Upscale to 4K</TooltipContent>
                    </Tooltip>
                  )}
                </div>
              )}
            </Card>

            {/* Cloud Sync Section */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Cloud className="h-4 w-4" /> Cloud Sync
                </CardTitle>
                <Switch
                  checked={cloudSyncStatus.isEnabled}
                  onCheckedChange={handleToggleSync}
                  disabled={!cloudSyncStatus.isAuthenticated || cloudSyncStatus.isSyncing}
                />
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground mb-4">
                  {cloudSyncStatus.isAuthenticated
                    ? cloudSyncStatus.isEnabled
                      ? `Sync enabled. Last sync: ${cloudSyncStatus.lastSync ? new Date(cloudSyncStatus.lastSync).toLocaleString() : "Never"}. Used: ${GalleryStorage.formatFileSize(cloudSyncStatus.storageUsed)} / ${GalleryStorage.formatFileSize(cloudSyncStatus.storageQuota)}`
                      : "Sync disabled. Enable to backup your gallery."
                    : "Sign in to enable cloud sync and backup your gallery."}
                </p>

                {!cloudSyncStatus.isAuthenticated ? (
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="email"
                          type="email"
                          placeholder="you@example.com"
                          value={authForm.email}
                          onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                          required
                          className="pl-8"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Password</Label>
                      <div className="relative">
                        <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          placeholder="••••••••"
                          value={authForm.password}
                          onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                          required
                          className="pl-8 pr-8"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                    {authMode === "signUp" && (
                      <div className="space-y-2">
                        <Label htmlFor="displayName">Display Name (Optional)</Label>
                        <div className="relative">
                          <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="displayName"
                            type="text"
                            placeholder="Your Name"
                            value={authForm.displayName}
                            onChange={(e) => setAuthForm({ ...authForm, displayName: e.target.value })}
                            className="pl-8"
                          />
                        </div>
                      </div>
                    )}
                    {authError && <p className="text-destructive text-sm">{authError}</p>}
                    <Button type="submit" className="w-full" disabled={authLoading}>
                      {authLoading ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : authMode === "signIn" ? (
                        "Sign In"
                      ) : (
                        "Sign Up"
                      )}
                    </Button>
                    <Button
                      type="button"
                      variant="link"
                      className="w-full"
                      onClick={() => setAuthMode(authMode === "signIn" ? "signUp" : "signIn")}
                    >
                      {authMode === "signIn" ? "Need an account? Sign Up" : "Already have an account? Sign In"}
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4" />
                      <span>
                        {cloudSyncStatus.isAuthenticated ? (currentUser?.email ?? "Unknown user") : "Not signed in"}
                      </span>
                    </div>
                    <Button
                      onClick={handleFullSync}
                      variant="outline"
                      className="w-full bg-transparent"
                      disabled={cloudSyncStatus.isSyncing}
                    >
                      {cloudSyncStatus.isSyncing ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="h-4 w-4 mr-2" />
                          Perform Full Sync
                        </>
                      )}
                    </Button>
                    <Button onClick={handleSignOut} variant="destructive" className="w-full">
                      Sign Out
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {syncConflicts.length > 0 && (
              <Card className="border-yellow-500 bg-yellow-50/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-700">
                    <Info className="h-5 w-5" />
                    Sync Conflicts ({syncConflicts.length})
                  </CardTitle>
                  <CardDescription>
                    Some images have different versions locally and in the cloud. Please choose which version to keep.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {syncConflicts.map((conflict) => (
                    <div key={conflict.localImage.id} className="border p-3 rounded-md space-y-2">
                      <p className="font-medium text-sm">
                        {conflict.localImage.metadata.filename} (Conflict Type: {conflict.type.replace("_", " ")})
                      </p>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <p className="font-semibold">Local Version:</p>
                          <p>Created: {new Date(conflict.localImage.metadata.createdAt).toLocaleString()}</p>
                          <p>Size: {GalleryStorage.formatFileSize(conflict.localImage.metadata.fileSize || 0)}</p>
                        </div>
                        <div>
                          <p className="font-semibold">Cloud Version:</p>
                          <p>Created: {new Date(conflict.cloudImage.metadata.createdAt).toLocaleString()}</p>
                          <p>Size: {GalleryStorage.formatFileSize(conflict.cloudImage.metadata.fileSize || 0)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict, "keep_local")}
                          className="flex-1"
                        >
                          <CheckCircle className="h-4 w-4 mr-1" /> Keep Local
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleResolveConflict(conflict, "keep_cloud")}
                          className="flex-1"
                        >
                          <UploadCloud className="h-4 w-4 mr-1" /> Keep Cloud
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* AI Image Generation Section */}
            <Card>
              <CardContent className="flex flex-col gap-4 p-6 sm:flex-row">
                <Input
                  placeholder="Describe the artwork you want..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={handleAIImageGenerate} disabled={isLoading} className="shrink-0">
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <ImagePlus className="mr-2 h-4 w-4" />
                  )}
                  {isLoading ? "Generating…" : "Generate"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  )
}

// 👇 add this as the last line of the file
export default FlowArtGenerator
