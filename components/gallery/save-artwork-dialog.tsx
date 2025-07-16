"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Save, Loader2, X, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { galleryService, type SaveArtworkData } from "@/lib/gallery-service"

interface SaveArtworkDialogProps {
  artworkData: {
    imageUrl: string
    svgContent?: string
    upscaledImageUrl?: string
    mode: "svg" | "ai"
    params: {
      dataset: string
      scenario: string
      seed: number
      numSamples: number
      noiseScale: number
      timeStep?: number
    }
    customPrompt?: string
    upscaleMethod?: string
  }
  onSaved?: () => void
}

export function SaveArtworkDialog({ artworkData, onSaved }: SaveArtworkDialogProps) {
  const [open, setOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const { toast } = useToast()

  // Generate auto title and tags when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen && !title) {
      const autoTitle = `${artworkData.params.dataset.charAt(0).toUpperCase() + artworkData.params.dataset.slice(1)} + ${artworkData.params.scenario.charAt(0).toUpperCase() + artworkData.params.scenario.slice(1)}`
      setTitle(autoTitle)

      const autoTags = [artworkData.params.dataset, artworkData.params.scenario, artworkData.mode]

      if (artworkData.upscaledImageUrl) {
        autoTags.push("enhanced")
      }

      if (artworkData.customPrompt) {
        autoTags.push("custom-prompt")
      }

      setTags(autoTags)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title Required",
        description: "Please enter a title for your artwork.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    try {
      const saveData: SaveArtworkData = {
        title: title.trim(),
        description: description.trim() || undefined,
        image_url: artworkData.imageUrl,
        svg_content: artworkData.svgContent,
        upscaled_image_url: artworkData.upscaledImageUrl,
        mode: artworkData.mode,
        dataset: artworkData.params.dataset,
        scenario: artworkData.params.scenario,
        seed: artworkData.params.seed,
        num_samples: artworkData.params.numSamples,
        noise_scale: artworkData.params.noiseScale,
        time_step: artworkData.params.timeStep,
        custom_prompt: artworkData.customPrompt,
        upscale_method: artworkData.upscaleMethod,
        tags,
      }

      await galleryService.saveArtwork(saveData)

      toast({
        title: "Artwork Saved! 🎨",
        description: "Your artwork has been added to the gallery.",
      })

      setOpen(false)
      onSaved?.()

      // Reset form
      setTitle("")
      setDescription("")
      setTags([])
    } catch (error: any) {
      console.error("Save error:", error)
      toast({
        title: "Save Failed",
        description: error.message || "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full bg-transparent">
          <Save className="h-4 w-4 mr-2" />
          Save to Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Save Artwork to Gallery</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <img
              src={artworkData.upscaledImageUrl || artworkData.imageUrl}
              alt="Artwork preview"
              className="w-full h-32 object-contain"
            />
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter artwork title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Add tag..."
                onKeyPress={(e) => e.key === "Enter" && addTag()}
              />
              <Button onClick={addTag} size="sm" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                  <button onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>

          {/* Generation Info */}
          <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-semibold mb-2">Generation Parameters</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>Mode: {artworkData.mode.toUpperCase()}</div>
              <div>Seed: {artworkData.params.seed}</div>
              <div>Dataset: {artworkData.params.dataset}</div>
              <div>Scenario: {artworkData.params.scenario}</div>
              <div>Samples: {artworkData.params.numSamples}</div>
              <div>Noise: {artworkData.params.noiseScale}</div>
            </div>
            {artworkData.customPrompt && (
              <div className="mt-2">
                <div className="text-xs font-medium">Custom Prompt:</div>
                <div className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{artworkData.customPrompt}</div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving || !title.trim()} className="flex-1">
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
            <Button variant="outline" onClick={() => setOpen(false)} disabled={saving}>
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
