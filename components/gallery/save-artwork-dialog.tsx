"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Save, Loader2, Sparkles, X } from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"

interface SaveArtworkDialogProps {
  artworkData: {
    imageUrl: string
    svgContent?: string
    upscaledImageUrl?: string
    mode: "flow" | "ai"
    params: {
      dataset: string
      scenario: string
      seed: number
      numSamples?: number
      noiseScale?: number
      timeStep?: number
    }
    customPrompt?: string
    upscaleMethod?: string
  }
  onSaved?: () => void
  children: React.ReactNode
}

export function SaveArtworkDialog({ artworkData, onSaved, children }: SaveArtworkDialogProps) {
  const [open, setOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customTags, setCustomTags] = useState("")
  const [tags, setTags] = useState<string[]>([])

  // Generate auto-suggestions when dialog opens
  const generateAutoSuggestions = () => {
    const autoTitle = `${artworkData.mode === "ai" ? "AI" : "Flow"} ${artworkData.params.dataset.charAt(0).toUpperCase() + artworkData.params.dataset.slice(1)} - ${artworkData.params.scenario.charAt(0).toUpperCase() + artworkData.params.scenario.slice(1)}`

    const autoDescription =
      artworkData.customPrompt ||
      `Generated using ${artworkData.params.dataset} dataset with ${artworkData.params.scenario} scenario styling. Seed: ${artworkData.params.seed}.`

    const autoTags = [
      artworkData.mode,
      artworkData.params.dataset,
      artworkData.params.scenario,
      ...(artworkData.mode === "ai" ? ["ai-generated", "artificial-intelligence"] : ["flow-field", "mathematical"]),
      ...(artworkData.upscaledImageUrl ? ["enhanced", "upscaled"] : []),
      ...(artworkData.customPrompt ? ["custom-prompt"] : []),
    ]

    setTitle(autoTitle)
    setDescription(autoDescription)
    setTags(autoTags)
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (newOpen) {
      generateAutoSuggestions()
    }
  }

  const addCustomTag = () => {
    if (customTags.trim() && !tags.includes(customTags.trim().toLowerCase())) {
      setTags([...tags, customTags.trim().toLowerCase()])
      setCustomTags("")
    }
  }

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title for your artwork")
      return
    }

    setIsSaving(true)

    try {
      const artworkToSave: Omit<ArtworkData, "id" | "createdAt" | "updatedAt"> = {
        title: title.trim(),
        description: description.trim() || undefined,
        imageUrl: artworkData.imageUrl,
        svgContent: artworkData.svgContent,
        upscaledImageUrl: artworkData.upscaledImageUrl,
        mode: artworkData.mode,
        dataset: artworkData.params.dataset,
        scenario: artworkData.params.scenario,
        seed: artworkData.params.seed,
        numSamples: artworkData.params.numSamples,
        noiseScale: artworkData.params.noiseScale,
        timeStep: artworkData.params.timeStep,
        customPrompt: artworkData.customPrompt,
        upscaleMethod: artworkData.upscaleMethod,
        tags: tags,
        isFavorite: false,
      }

      const savedArtwork = await galleryService.saveArtwork(artworkToSave)

      if (savedArtwork) {
        setOpen(false)
        onSaved?.()

        // Reset form
        setTitle("")
        setDescription("")
        setCustomTags("")
        setTags([])
      } else {
        alert("Failed to save artwork. Please try again.")
      }
    } catch (error) {
      console.error("Error saving artwork:", error)
      alert("Failed to save artwork. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save to Gallery
          </DialogTitle>
          <DialogDescription>
            Add your artwork to your personal gallery with custom title, description, and tags.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Preview */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
            <img
              src={artworkData.upscaledImageUrl || artworkData.imageUrl}
              alt="Artwork preview"
              className="w-full h-48 object-contain"
            />
            <div className="absolute top-2 right-2 flex gap-1">
              <Badge variant={artworkData.mode === "ai" ? "default" : "outline"}>
                {artworkData.mode === "ai" ? "🤖 AI" : "📊 Flow"}
              </Badge>
              {artworkData.upscaledImageUrl && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              )}
            </div>
          </div>

          {/* Generation Parameters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <span className="text-gray-600 dark:text-gray-400">Dataset:</span>
              <p className="font-medium capitalize">{artworkData.params.dataset}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Scenario:</span>
              <p className="font-medium capitalize">{artworkData.params.scenario}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Seed:</span>
              <p className="font-medium">{artworkData.params.seed}</p>
            </div>
            <div>
              <span className="text-gray-600 dark:text-gray-400">Mode:</span>
              <p className="font-medium">{artworkData.mode === "ai" ? "AI Generated" : "Flow Field"}</p>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
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

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork..."
                rows={3}
                className="mt-1 resize-none"
              />
            </div>

            {/* Tags */}
            <div>
              <Label>Tags</Label>
              <div className="mt-1 space-y-2">
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={customTags}
                    onChange={(e) => setCustomTags(e.target.value)}
                    placeholder="Add custom tags..."
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        addCustomTag()
                      }
                    }}
                  />
                  <Button type="button" onClick={addCustomTag} variant="outline" size="sm">
                    Add
                  </Button>
                </div>
              </div>
            </div>

            {artworkData.customPrompt && (
              <div className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                <Label className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                  Custom Prompt Used:
                </Label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{artworkData.customPrompt}</p>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()}>
            {isSaving ? (
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
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
