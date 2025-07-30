"use client"

import type React from "react"
import type { User as SupabaseUser } from "@supabase/supabase-js"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import {
  Loader2,
  Shuffle,
  Wand2,
  Sparkles,
  Download,
  Cloud,
  UploadCloud,
  CheckCircle,
  Info,
  RefreshCcw,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  ImagePlus,
} from "lucide-react"
import { FlowModel, type FlowArtSettings, DATASETS, SCENARIOS, COLOR_SCHEMES } from "@/lib/flow-model"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { CloudSync, type CloudSyncStatus, type SyncConflict } from "@/lib/cloud-sync"
import { supabase } from "@/lib/supabase"
import { ImageCompression } from "@/lib/image-compression"

interface FlowArtGeneratorProps {
  initialSettings?: Partial<FlowArtSettings>
}

export function FlowArtGenerator({ initialSettings }: FlowArtGeneratorProps) {
  const { toast } = useToast()
  const [settings, setSettings] = useState<FlowArtSettings>(() => FlowModel.validateSettings(initialSettings || {}))
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generationMode, setGenerationMode] = useState<"svg" | "ai">("svg")
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

  const updateSetting = useCallback(<K extends keyof FlowArtSettings>(key: K, value: FlowArtSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }, [])

  const randomizeSeed = useCallback(() => {
    updateSetting("seed", FlowModel.generateSeed())
  }, [updateSetting])

  const generateArt = useCallback(async () => {
    setIsGenerating(true)
    try {
      const endpoint = generationMode === "svg" ? "/api/generate-art" : "/api/generate-ai-art"

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate art")
      }

      const data = await response.json()
      const imageUrl = data.imageUrl || data.output?.[0]

      if (!imageUrl) {
        throw new Error("No image generated")
      }

      setGeneratedImage(imageUrl)

      // Save to gallery
      const imageSize = await ImageCompression.getImageSize(imageUrl)
      const galleryImage: GalleryImage = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        imageUrl,
        metadata: {
          ...settings,
          generationMode,
          createdAt: Date.now(),
          filename: `flowsketch-${settings.dataset}-${Date.now()}`,
          fileSize: imageSize.size,
        },
        isFavorite: false,
        tags: [settings.dataset, settings.scenario, settings.colorScheme],
      }

      GalleryStorage.saveImage(galleryImage)

      // Dispatch event for gallery to update
      window.dispatchEvent(new CustomEvent("new-image", { detail: imageUrl }))

      toast({
        title: "Art Generated!",
        description: `Created ${generationMode.toUpperCase()} artwork with ${settings.samples} samples.`,
      })
    } catch (error: any) {
      console.error("Error generating art:", error)
      toast({
        title: "Generation Failed",
        description: error.message || "Could not generate artwork.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }, [settings, generationMode, toast])

  const handleUpscale = async () => {
    if (!generatedImage || !currentImageId) return

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

      setGeneratedImage(upscaledImageUrl)
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
      setGeneratedImage(imageUrl)
    } catch (err: any) {
      toast({ title: err.message ?? "Unknown error", variant: "destructive" })
    } finally {
      setIsLoading(false)
    }
  }

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

  return (
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              FlowSketch Generator
            </CardTitle>
            <CardDescription>Create mathematical art with customizable parameters</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4">
              <div className="space-y-2">
                <Label>Generation Mode</Label>
                <Select value={generationMode} onValueChange={(value: "svg" | "ai") => setGenerationMode(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="svg">SVG Mathematical</SelectItem>
                    <SelectItem value="ai">AI Generated</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Dataset</Label>
                <Select value={settings.dataset} onValueChange={(value) => updateSetting("dataset", value)}>
                  <SelectTrigger>
                    <SelectValue />
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
                <Label>Scenario</Label>
                <Select value={settings.scenario} onValueChange={(value) => updateSetting("scenario", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(SCENARIOS).map(([key, value]) => (
                      <SelectItem key={key} value={key}>
                        {value
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Color Scheme</Label>
                <Select value={settings.colorScheme} onValueChange={(value) => updateSetting("colorScheme", value)}>
                  <SelectTrigger>
                    <SelectValue />
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

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="seed">Seed</Label>
                  <Button variant="outline" size="sm" onClick={randomizeSeed}>
                    <Shuffle className="h-4 w-4" />
                  </Button>
                </div>
                <Input
                  id="seed"
                  type="number"
                  value={settings.seed}
                  onChange={(e) => updateSetting("seed", Number.parseInt(e.target.value) || 1)}
                  min={1}
                  max={10000}
                />
              </div>

              <div className="space-y-2">
                <Label>Samples: {settings.samples}</Label>
                <Slider
                  value={[settings.samples]}
                  onValueChange={([value]) => updateSetting("samples", value)}
                  min={10}
                  max={1000}
                  step={10}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label>Noise: {settings.noise.toFixed(2)}</Label>
                <Slider
                  value={[settings.noise]}
                  onValueChange={([value]) => updateSetting("noise", value)}
                  min={0}
                  max={1}
                  step={0.01}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="upscale"
                  checked={settings.upscale}
                  onCheckedChange={(checked) => updateSetting("upscale", checked)}
                />
                <Label htmlFor="upscale">Enable Upscaling</Label>
              </div>
            </div>

            <Button onClick={generateArt} disabled={isGenerating} className="w-full">
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate Art
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {generatedImage && (
          <Card>
            <CardHeader>
              <CardTitle>Generated Artwork</CardTitle>
              <CardDescription>
                {generationMode.toUpperCase()} • {settings.samples} samples • Seed: {settings.seed}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <img
                  src={generatedImage || "/placeholder.svg"}
                  alt="Generated artwork"
                  className="w-full h-auto rounded-lg border"
                />
                <div className="absolute bottom-4 right-4 flex gap-2">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        onClick={() => handleDownloadImage(generatedImage, generationMode === "svg" ? "svg" : "png")}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Download Image</TooltipContent>
                  </Tooltip>
                  {generationMode === "ai" && !upscaling && (
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
              </div>
            </CardContent>
          </Card>
        )}

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
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ImagePlus className="mr-2 h-4 w-4" />}
              {isLoading ? "Generating…" : "Generate"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}
