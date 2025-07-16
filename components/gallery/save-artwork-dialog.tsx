"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Save, X, Sparkles, Heart } from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface SaveArtworkDialogProps {
  artwork: Omit<ArtworkData, "id" | "createdAt" | "updatedAt">
  trigger?: React.ReactNode
  onSaved?: (id: string) => void
}

export function SaveArtworkDialog({ artwork, trigger, onSaved }: SaveArtworkDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(artwork.title)
  const [description, setDescription] = useState(artwork.description || "")
  const [tags, setTags] = useState<string[]>(artwork.tags || [])
  const [newTag, setNewTag] = useState("")
  const [isFavorite, setIsFavorite] = useState(artwork.isFavorite || false)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const generateTitle = () => {
    const adjectives = ["Stunning", "Ethereal", "Vibrant", "Mystical", "Dynamic", "Elegant", "Bold", "Serene"]
    const nouns = ["Creation", "Vision", "Masterpiece", "Artwork", "Design", "Composition", "Expression"]
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)]
    const noun = nouns[Math.floor(Math.random() * nouns.length)]
    setTitle(`${adjective} ${noun}`)
  }

  const generateTags = () => {
    const baseTags = [artwork.mode, artwork.dataset]
    if (artwork.scenario) baseTags.push(artwork.scenario)

    const additionalTags = {
      neural_networks: ["brain", "connectivity", "neurons", "synapses"],
      dna_sequences: ["genetic", "molecular", "helix", "biology"],
      quantum_fields: ["physics", "particles", "quantum", "energy"],
      cosmic_phenomena: ["space", "stars", "galaxy", "universe"],
      fractal_geometry: ["mathematics", "patterns", "recursive", "geometry"],
      protein_folding: ["biochemistry", "structure", "amino acids", "proteins"],
      brain_connectivity: ["neuroscience", "networks", "cognition", "neural"],
      crystalline_structures: ["chemistry", "lattice", "crystal", "molecular"],
    }

    const datasetTags = additionalTags[artwork.dataset as keyof typeof additionalTags] || []
    const randomTags = datasetTags.slice(0, 2 + Math.floor(Math.random() * 2))

    setTags([...new Set([...baseTags, ...randomTags])])
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
        title: "Title required",
        description: "Please enter a title for your artwork.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)

    const artworkToSave: ArtworkData = {
      ...artwork,
      title: title.trim(),
      description: description.trim() || undefined,
      tags,
      isFavorite,
    }

    const savedId = await galleryService.saveArtwork(artworkToSave)

    if (savedId) {
      toast({
        title: "Artwork saved!",
        description: `"${title}" has been added to your gallery.`,
      })
      onSaved?.(savedId)
      setOpen(false)
    } else {
      toast({
        title: "Save failed",
        description: "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    }

    setSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Save to Gallery
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Save Artwork to Gallery</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Preview */}
          <div className="space-y-4">
            <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
              {artwork.mode === "flow" && artwork.svgContent ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: artwork.svgContent }}
                />
              ) : (
                <img
                  src={artwork.upscaledImageUrl || artwork.imageUrl}
                  alt="Generated artwork"
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Metadata */}
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Badge variant={artwork.mode === "ai" ? "default" : "outline"}>
                  {artwork.mode === "ai" ? "🤖 AI" : "📊 Flow"}
                </Badge>
                <Badge variant="outline">{artwork.dataset}</Badge>
                {artwork.scenario && <Badge variant="outline">{artwork.scenario}</Badge>}
              </div>
              <div className="text-muted-foreground">
                <div>Seed: {artwork.seed}</div>
                {artwork.upscaledImageUrl && (
                  <div className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    Enhanced
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="title">Title</Label>
                <Button type="button" variant="ghost" size="sm" onClick={generateTitle} className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter artwork title..."
                maxLength={100}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (optional)</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork..."
                rows={3}
                maxLength={500}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Tags</Label>
                <Button type="button" variant="ghost" size="sm" onClick={generateTags} className="text-xs">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Generate
                </Button>
              </div>

              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">
                  Add
                </Button>
              </div>

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-red-500">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="favorite"
                checked={isFavorite}
                onChange={(e) => setIsFavorite(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="favorite" className="flex items-center gap-2">
                <Heart className={`h-4 w-4 ${isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                Mark as favorite
              </Label>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? "Saving..." : "Save Artwork"}
              </Button>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
