"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Save, Loader2, X } from "lucide-react"
import { GalleryService, type ArtworkData } from "@/lib/gallery-service"

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
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customTags, setCustomTags] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Generate auto tags based on artwork data
  const generateAutoTags = () => {
    const tags = [artworkData.mode, artworkData.params.dataset, artworkData.params.scenario]

    if (artworkData.upscaledImageUrl) {
      tags.push("enhanced")
    }

    if (artworkData.customPrompt) {
      tags.push("custom-prompt")
    }

    // Add scientific tag for scientific datasets
    const scientificDatasets = [
      "neural_networks",
      "quantum_fields",
      "dna_sequences",
      "cosmic_phenomena",
      "fractal_geometry",
      "protein_folding",
      "brain_connectivity",
      "crystalline_structures",
    ]

    if (scientificDatasets.includes(artworkData.params.dataset)) {
      tags.push("scientific")
    }

    return tags.filter(Boolean)
  }

  // Generate auto title
  const generateAutoTitle = () => {
    const datasetName = artworkData.params.dataset.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    const scenarioName = artworkData.params.scenario.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
    return `${datasetName} ${scenarioName} Art`
  }

  const handleSave = async () => {
    setIsSaving(true)

    try {
      const autoTags = generateAutoTags()
      const manualTags = customTags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)

      const allTags = [...new Set([...autoTags, ...manualTags])]

      const artwork: Omit<ArtworkData, "id" | "createdAt" | "updatedAt"> = {
        title: title || generateAutoTitle(),
        description:
          description ||
          `Generated ${artworkData.mode} artwork using ${artworkData.params.dataset} dataset with ${artworkData.params.scenario} styling`,
        imageUrl: artworkData.imageUrl,
        upscaledImageUrl: artworkData.upscaledImageUrl,
        svgContent: artworkData.svgContent,
        mode: artworkData.mode,
        dataset: artworkData.params.dataset,
        scenario: artworkData.params.scenario,
        seed: artworkData.params.seed,
        numSamples: artworkData.params.numSamples,
        noiseScale: artworkData.params.noiseScale,
        timeStep: artworkData.params.timeStep,
        customPrompt: artworkData.customPrompt,
        upscaleMethod: artworkData.upscaleMethod,
        tags: allTags,
        isFavorite: false,
      }

      await GalleryService.saveArtwork(artwork)

      setOpen(false)
      setTitle("")
      setDescription("")
      setCustomTags("")

      if (onSaved) {
        onSaved()
      }
    } catch (error) {
      console.error("Error saving artwork:", error)
      alert("Failed to save artwork. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  const removeTag = (tagToRemove: string) => {
    const tags = customTags
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag !== tagToRemove)
    setCustomTags(tags.join(", "))
  }

  const autoTags = generateAutoTags()
  const manualTags = customTags
    .split(",")
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
              <Badge variant={artworkData.mode === "ai" ? "default" : "outline"} className="text-xs">
                {artworkData.mode === "ai" ? "🤖 AI" : "📊 Flow"}
              </Badge>
              {artworkData.upscaledImageUrl && (
                <Badge variant="secondary" className="text-xs">
                  Enhanced
                </Badge>
              )}
            </div>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={generateAutoTitle()}
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your artwork..."
              rows={3}
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>

            {/* Auto Tags */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">Auto-generated tags:</p>
              <div className="flex flex-wrap gap-1">
                {autoTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Manual Tags */}
            <div className="space-y-2">
              <Label htmlFor="custom-tags" className="text-xs">
                Additional tags (comma-separated):
              </Label>
              <Input
                id="custom-tags"
                value={customTags}
                onChange={(e) => setCustomTags(e.target.value)}
                placeholder="abstract, colorful, experimental..."
              />
              {manualTags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {manualTags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Generation Parameters */}
          <div className="space-y-2">
            <Label className="text-xs font-medium">Generation Parameters</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-muted-foreground">
              <div>Dataset: {artworkData.params.dataset}</div>
              <div>Scenario: {artworkData.params.scenario}</div>
              <div>Seed: {artworkData.params.seed}</div>
              <div>Mode: {artworkData.mode === "ai" ? "AI Generated" : "Flow Field"}</div>
              {artworkData.params.numSamples && <div>Samples: {artworkData.params.numSamples}</div>}
              {artworkData.params.noiseScale && <div>Noise: {artworkData.params.noiseScale.toFixed(2)}</div>}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save to Gallery
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
