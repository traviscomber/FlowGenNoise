"use client"

import { useState, useCallback } from "react"
import { Settings, Download, Sparkles, Wand2 } from "lucide-react"
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Slider,
  Progress,
  Badge,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui" // shadcn/ui barrel export (adjust if you do not use a barrel)

interface EnhanceSettings {
  scale: number
  enhanceMode: "photo" | "artwork" | "anime" | "generic"
  denoiseStrength: number
  sharpenStrength: number
}

interface Props {
  baseImageUrl: string
  onEnhancedImage: (url: string, meta: Record<string, unknown>) => void
}

export function ImageEnhancementSuite({ baseImageUrl, onEnhancedImage }: Props) {
  /* --- state --- */
  const [settings, setSettings] = useState<EnhanceSettings>({
    scale: 2,
    enhanceMode: "generic",
    denoiseStrength: 0.5,
    sharpenStrength: 0.3,
  })
  const [processing, setProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [enhancedUrl, setEnhancedUrl] = useState<string | null>(null)
  const [showAdvanced, setShowAdvanced] = useState(false)

  /* ------------------------------------------------------------------ */
  /* HELPERS                                                            */
  /* ------------------------------------------------------------------ */

  // convert a base64 / data-url into a File for multi-part POST
  const dataUrlToFile = (dataUrl: string, filename: string): File => {
    const [meta, data] = dataUrl.split(",")
    const mime = meta.match(/:(.*?);/)?.[1] || "image/png"
    const binary = atob(data)
    const array = new Uint8Array(binary.length)
    for (let i = 0; i < binary.length; i++) array[i] = binary.charCodeAt(i)
    return new File([array], filename, { type: mime })
  }

  // ---------- CLIENT-SIDE FALLBACK ----------
  const enhanceLocally = async (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => {
        const w = img.width * settings.scale
        const h = img.height * settings.scale
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) return reject(new Error("Canvas not supported"))

        // basic filter presets
        const filters: Record<string, string> = {
          generic: "",
          photo: "brightness(1.02) saturate(1.05)",
          artwork: "brightness(1.01) saturate(1.10)",
          anime: "brightness(1.03) saturate(1.15)",
        }

        ctx.filter = filters[settings.enhanceMode] || ""
        ctx.drawImage(img, 0, 0, w, h)

        canvas.toBlob(
          (blob) => {
            if (!blob) return reject(new Error("Blob conversion failed"))
            const url = URL.createObjectURL(blob)
            resolve(url)
          },
          "image/jpeg",
          0.95,
        )
      }
      img.onerror = reject
      img.src = baseImageUrl
    })
  }

  /* ------------------------------------------------------------------ */
  /* UPSCALE HANDLER                                                    */
  /* ------------------------------------------------------------------ */
  const handleEnhance = useCallback(async () => {
    if (!baseImageUrl) return
    setProcessing(true)
    setProgress(0)

    // optimistic progress simulation
    const tick = setInterval(() => setProgress((p) => Math.min(p + 5, 90)), 150)

    // attempt server route first
    try {
      const formData = new FormData()
      formData.append("image", dataUrlToFile(baseImageUrl, "source.png"))
      formData.append("scale", settings.scale.toString())
      formData.append("enhanceMode", settings.enhanceMode)
      formData.append("denoiseStrength", settings.denoiseStrength.toString())
      formData.append("sharpenStrength", settings.sharpenStrength.toString())

      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 15_000) // 15 s

      const res = await fetch("/api/enhance-image", {
        method: "POST",
        body: formData,
        signal: controller.signal,
      }).catch((err) => {
        // fetch aborted or network failure
        console.warn("Server enhancement failed, falling back:", err)
        return null
      })

      clearTimeout(timeout)

      if (res && res.ok) {
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        setProgress(100)
        setEnhancedUrl(url)
        onEnhancedImage(url, { ...settings, method: "server" })
      } else {
        // ---------- FALLBACK ----------
        const url = await enhanceLocally()
        setProgress(100)
        setEnhancedUrl(url)
        onEnhancedImage(url, { ...settings, method: "client-fallback" })
      }
    } catch (err) {
      console.error("Enhancement error:", err)
      // fallback if something unexpected happened
      try {
        const url = await enhanceLocally()
        setEnhancedUrl(url)
        onEnhancedImage(url, { ...settings, method: "client-fallback" })
      } catch (err2) {
        console.error("Local enhancement also failed:", err2)
      }
    } finally {
      clearInterval(tick)
      setTimeout(() => setProgress(0), 400)
      setProcessing(false)
    }
  }, [baseImageUrl, settings, onEnhancedImage])

  /* ------------------------------------------------------------------ */
  /* DOWNLOAD                                                           */
  /* ------------------------------------------------------------------ */
  const downloadEnhanced = () => {
    if (!enhancedUrl) return
    const a = document.createElement("a")
    a.href = enhancedUrl
    a.download = `enhanced_${settings.scale}x.jpg`
    a.click()
  }

  /* ------------------------------------------------------------------ */
  /* RENDER                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <Card className="w-full bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 border border-purple-500/30">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-xl">
          <Wand2 className="text-purple-400" /> AI Enhancement Suite
        </CardTitle>
        <p className="text-center text-sm text-gray-400">
          Upscale &amp; refine your art in one click – works offline if needed.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* ----- SETTINGS ROW ----- */}
        <div className="grid grid-cols-2 gap-4">
          {/* mode */}
          <div className="space-y-2">
            <Label>Mode</Label>
            <Select
              value={settings.enhanceMode}
              onValueChange={(v) => setSettings((s) => ({ ...s, enhanceMode: v as any }))}
            >
              <SelectTrigger className="bg-white/10 border-white/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["generic", "photo", "artwork", "anime"] as const).map((m) => (
                  <SelectItem key={m} value={m}>
                    <span className="flex items-center gap-2">
                      <Badge variant="secondary" className="capitalize">
                        {m}
                      </Badge>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* scale */}
          <div className="space-y-2">
            <Label>Scale: {settings.scale}×</Label>
            <Slider
              min={1}
              max={4}
              step={0.5}
              value={[settings.scale]}
              onValueChange={([v]) => setSettings((s) => ({ ...s, scale: v }))}
            />
          </div>
        </div>

        {/* ----- ADVANCED ----- */}
        <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Advanced Settings
              </span>
              <span className="text-xs">{showAdvanced ? "Hide" : "Show"}</span>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-4 space-y-4">
            <div className="space-y-2">
              <Label>Denoise: {settings.denoiseStrength.toFixed(1)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[settings.denoiseStrength]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, denoiseStrength: v }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Sharpen: {settings.sharpenStrength.toFixed(1)}</Label>
              <Slider
                min={0}
                max={1}
                step={0.1}
                value={[settings.sharpenStrength]}
                onValueChange={([v]) => setSettings((s) => ({ ...s, sharpenStrength: v }))}
              />
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* ----- ACTION BUTTON ----- */}
        <Button
          onClick={handleEnhance}
          disabled={processing}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          {processing ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-white" />
              Enhancing… {progress}%
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" /> Enhance Image
            </>
          )}
        </Button>

        {processing && <Progress value={progress} />}

        {/* ----- RESULT ----- */}
        {enhancedUrl && (
          <div className="space-y-4">
            <img src={enhancedUrl || "/placeholder.svg"} alt="Enhanced" className="w-full rounded-lg shadow-lg" />
            <Button
              onClick={downloadEnhanced}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Download className="mr-2 h-4 w-4" /> Download ({settings.scale}×)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
