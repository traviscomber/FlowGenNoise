"use client"
import { X, Plus } from "lucide-react" // Importing X and Plus icons
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import type { GenerationParams } from "@/lib/flow-model"
import { GalleryService, type SaveArtworkParams } from "@/lib/gallery-service"

interface SaveArtworkDialogProps {
  isOpen: boolean
  onClose: () => void
  onSaved: () => void
  imageUrl: string
  upscaledImageUrl?: string
  generationParams: GenerationParams
  mode: "svg" | "ai"
  customPrompt?: string
  upscaleMethod?: string
}

export function SaveArtworkDialog({
  isOpen,
  onClose,
  onSaved,
  imageUrl,
  upscaledImageUrl,
  generationParams,
  mode,
  customPrompt,
  upscaleMethod,
}: SaveArtworkDialogProps) {
  const [title, setTitle] = useState(() => {
    const timestamp = new Date().toLocaleString()
    return `${mode.toUpperCase()} Art - ${generationParams.dataset} - ${timestamp}`
  })
  const [description, setDescription] = useState("")
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)

  if (!isOpen) return null

  // Auto-generated tags
  const autoTags = [
    generationParams.dataset,
    generationParams.scenario,
    mode,
    `${generationParams.numSamples}-points`,
    `seed-${generationParams.seed}`,
  ]

  if (upscaledImageUrl) {
    autoTags.push("enhanced")
  }

  if (customPrompt) {
    autoTags.push("custom-prompt")
  }

  const allTags = [...new Set([...autoTags, ...customTags])]

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim())) {
      setCustomTags([...customTags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeCustomTag = (tag: string) => {
    setCustomTags(customTags.filter((t) => t !== tag))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your artwork",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const params: SaveArtworkParams = {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl,
        upscaledImageUrl,
        generationParams,
        mode,
        customPrompt,
        upscaleMethod,
        tags: customTags,
      }

      await GalleryService.saveArtwork(params)

      toast({
        title: "Artwork saved!",
        description: `"${title}" has been added to your gallery.`,
      })

      onSaved()
      onClose()
    } catch (error) {
      toast({
        title: "Save failed",
        description: "Failed to save artwork to gallery",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Save Artwork to Gallery</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 overflow-hidden">
          {/* Preview */}
          <div className="w-48 flex-shrink-0">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img src={upscaledImageUrl || imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <Badge variant={mode === "ai" ? "default" : "secondary"} className="w-full justify-center">
                {mode === "ai" ? "AI Art" : "SVG Flow"}
              </Badge>
              {upscaledImageUrl && (
                <Badge variant="outline" className="w-full justify-center">
                  Enhanced
                </Badge>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter artwork title..."
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>

              {/* Auto-generated tags */}
              <div>
                <div className="text-sm text-gray-600 mb-2">Auto-generated tags:</div>
                <div className="flex flex-wrap gap-1">
                  {autoTags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom tags */}
              {customTags.length > 0 && (
                <div>
                  <div className="text-sm text-gray-600 mb-2">Custom tags:</div>
                  <div className="flex flex-wrap gap-1">
                    {customTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-red-50"
                        onClick={() => removeCustomTag(tag)}
                      >
                        {tag} <X className="w-3 h-3 ml-1" />
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Add custom tag */}
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add custom tag"
                  onKeyPress={(e) => e.key === "Enter" && addCustomTag()}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomTag} disabled={!newTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Generation Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm font-medium mb-2">Generation Parameters</div>
              <div className="text-xs text-gray-600 space-y-1">
                <div>Dataset: {generationParams.dataset}</div>
                <div>Scenario: {generationParams.scenario}</div>
                <div>Points: {generationParams.numSamples}</div>
                <div>Seed: {generationParams.seed}</div>
                {customPrompt && <div>Custom Prompt: {customPrompt}</div>}
                {upscaleMethod && <div>Enhancement: {upscaleMethod}</div>}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? "Saving..." : "Save to Gallery"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
