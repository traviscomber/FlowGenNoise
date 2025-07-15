"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Save, Sparkles } from "lucide-react"
import { GalleryService, type SaveArtworkParams } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface SaveArtworkDialogProps {
  open: boolean
  onClose: () => void
  artworkData: SaveArtworkParams | null
  onSaved?: () => void
}

export function SaveArtworkDialog({ open, onClose, artworkData, onSaved }: SaveArtworkDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customTags, setCustomTags] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  // Reset form when dialog opens/closes
  useState(() => {
    if (open && artworkData) {
      // Generate default title
      const defaultTitle = `${artworkData.generationParams.dataset.charAt(0).toUpperCase() + artworkData.generationParams.dataset.slice(1)} + ${artworkData.generationParams.scenario.charAt(0).toUpperCase() + artworkData.generationParams.scenario.slice(1)}`
      setTitle(defaultTitle)
      setDescription("")
      setCustomTags("")
      setError(null)
    }
  })

  const handleSave = async () => {
    if (!artworkData || !title.trim()) {
      setError("Title is required")
      return
    }

    setSaving(true)
    setError(null)

    try {
      // Parse custom tags
      const customTagsArray = customTags
        .split(",")
        .map((tag) => tag.trim().toLowerCase())
        .filter((tag) => tag.length > 0)

      await GalleryService.saveArtwork({
        ...artworkData,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: customTagsArray,
      })

      toast({
        title: "Artwork saved! 🎨",
        description: `"${title}" has been added to your gallery.`,
      })

      onSaved?.()
      onClose()
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Failed to save artwork",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  if (!artworkData) return null

  // Generate auto tags preview
  const autoTags = [
    artworkData.generationParams.dataset,
    artworkData.generationParams.scenario,
    artworkData.mode,
    `${artworkData.generationParams.numSamples}-points`,
    `seed-${artworkData.generationParams.seed}`,
  ]

  if (artworkData.upscaledImageUrl) {
    autoTags.push("enhanced")
  }

  if (artworkData.customPrompt) {
    autoTags.push("custom-prompt")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Artwork to Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex gap-4">
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 flex-shrink-0">
              <img
                src={artworkData.upscaledImageUrl || artworkData.imageUrl}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <Badge variant={artworkData.mode === "ai" ? "default" : "outline"}>
                  {artworkData.mode === "ai" ? "🤖 AI Art" : "📊 SVG"}
                </Badge>
                <Badge variant="outline">{artworkData.generationParams.dataset}</Badge>
                <Badge variant="outline">{artworkData.generationParams.scenario}</Badge>
                {artworkData.upscaledImageUrl && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {artworkData.generationParams.numSamples.toLocaleString()} points • Seed{" "}
                {artworkData.generationParams.seed}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter artwork title"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Optional description of your artwork"
                rows={3}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="tags">Custom Tags</Label>
              <Input
                id="tags"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="Enter custom tags separated by commas"
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Separate multiple tags with commas. Auto-tags will be added automatically.
              </p>
            </div>

            {/* Auto tags preview */}
            <div>
              <Label className="text-sm">Auto-generated tags:</Label>
              <div className="flex flex-wrap gap-1 mt-1">
                {autoTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving || !title.trim()}>
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save to Gallery
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
