"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, X, Plus } from "lucide-react"
import { galleryService, type CreateGalleryItem } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface SaveArtworkDialogProps {
  imageUrl: string
  svgContent?: string
  upscaledImageUrl?: string
  mode: "svg" | "ai"
  generationParams: {
    dataset: string
    scenario: string
    seed: number
    numSamples: number
    noiseScale: number
    timeStep?: number
    customPrompt?: string
    upscaleMethod?: string
  }
  children: React.ReactNode
}

export function SaveArtworkDialog({
  imageUrl,
  svgContent,
  upscaledImageUrl,
  mode,
  generationParams,
  children,
}: SaveArtworkDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()

  // Generate auto-suggestions when dialog opens
  const generateAutoSuggestions = () => {
    const autoTitle = `${generationParams.dataset} - ${generationParams.scenario}`
    const autoTags = [
      generationParams.dataset.toLowerCase(),
      generationParams.scenario.toLowerCase(),
      mode,
      ...(generationParams.customPrompt ? ["custom"] : []),
      ...(upscaledImageUrl ? ["upscaled"] : []),
    ].filter(Boolean)

    setTitle(autoTitle)
    setTags(autoTags)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      generateAutoSuggestions()
    } else {
      // Reset form when closing
      setTitle("")
      setDescription("")
      setTags([])
      setNewTag("")
    }
  }

  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim().toLowerCase())) {
      setTags([...tags, newTag.trim().toLowerCase()])
      setNewTag("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault()
      addTag()
    }
  }

  const handleSave = async () => {
    if (!title.trim()) {
      toast({
        title: "Title required",
        description: "Please enter a title for your artwork.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)

    const artworkData: CreateGalleryItem = {
      title: title.trim(),
      description: description.trim() || undefined,
      image_url: imageUrl,
      svg_content: svgContent,
      upscaled_image_url: upscaledImageUrl,
      mode,
      dataset: generationParams.dataset,
      scenario: generationParams.scenario,
      seed: generationParams.seed,
      num_samples: generationParams.numSamples,
      noise_scale: generationParams.noiseScale,
      time_step: generationParams.timeStep,
      custom_prompt: generationParams.customPrompt,
      upscale_method: generationParams.upscaleMethod,
      tags,
      is_favorite: false,
    }

    const result = await galleryService.saveArtwork(artworkData)

    if (result) {
      toast({
        title: "Artwork saved!",
        description: "Your artwork has been added to the gallery.",
      })
      setOpen(false)
    } else {
      toast({
        title: "Save failed",
        description: "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    }

    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save to Gallery
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Preview */}
          <div className="flex gap-4">
            <div className="flex-shrink-0">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Generated artwork"
                className="w-32 h-32 object-cover rounded-lg border"
              />
            </div>
            <div className="flex-1 space-y-2">
              <div className="text-sm text-muted-foreground">
                <div>
                  <strong>Mode:</strong> {mode.toUpperCase()}
                </div>
                <div>
                  <strong>Dataset:</strong> {generationParams.dataset}
                </div>
                <div>
                  <strong>Scenario:</strong> {generationParams.scenario}
                </div>
                <div>
                  <strong>Seed:</strong> {generationParams.seed}
                </div>
                {generationParams.customPrompt && (
                  <div>
                    <strong>Custom Prompt:</strong> {generationParams.customPrompt}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter artwork title..."
              maxLength={100}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description for your artwork..."
              rows={3}
              maxLength={500}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag..."
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addTag} disabled={!newTag.trim()}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
              {isSaving ? "Saving..." : "Save to Gallery"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
