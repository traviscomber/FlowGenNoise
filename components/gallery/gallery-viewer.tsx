"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Heart, Download, Trash2, X, Copy, Sparkles, Calendar, Tag, Palette, Settings } from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface GalleryViewerProps {
  artwork: ArtworkData | null
  open: boolean
  onClose: () => void
  onUpdate?: () => void
  onDelete?: (id: string) => void
}

export function GalleryViewer({ artwork, open, onClose, onUpdate, onDelete }: GalleryViewerProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!artwork) return null

  const handleToggleFavorite = async () => {
    if (!artwork.id) return

    setLoading(true)
    const success = await galleryService.toggleFavorite(artwork.id)
    setLoading(false)

    if (success) {
      onUpdate?.()
      toast({
        title: artwork.isFavorite ? "Removed from favorites" : "Added to favorites",
        description: `"${artwork.title}" has been ${artwork.isFavorite ? "removed from" : "added to"} your favorites.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      })
    }
  }

  const handleDownload = async () => {
    try {
      const imageUrl = artwork.upscaledImageUrl || artwork.imageUrl
      const isEnhanced = !!artwork.upscaledImageUrl
      const fileName = `${artwork.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${artwork.seed}${isEnhanced ? "_enhanced" : ""}.png`

      if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
        const link = document.createElement("a")
        link.href = imageUrl
        link.download = fileName
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        const response = await fetch(imageUrl, { mode: "cors" })
        if (!response.ok) throw new Error("Failed to fetch image")

        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)

        const link = document.createElement("a")
        link.href = blobUrl
        link.download = fileName
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)

        setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
      }

      toast({
        title: "Download started",
        description: `Downloading "${artwork.title}"`,
      })
    } catch (error) {
      console.error("Download failed:", error)
      toast({
        title: "Download failed",
        description: "Failed to download the artwork.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async () => {
    if (!artwork.id) return

    if (!confirm(`Are you sure you want to delete "${artwork.title}"?`)) return

    setLoading(true)
    const success = await galleryService.deleteArtwork(artwork.id)
    setLoading(false)

    if (success) {
      onDelete?.(artwork.id)
      onClose()
      toast({
        title: "Artwork deleted",
        description: `"${artwork.title}" has been deleted from your gallery.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete artwork.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied to clipboard",
        description: `${label} copied to clipboard.`,
      })
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[95vh] p-0 overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Image Section */}
          <div className="lg:col-span-2 relative bg-black flex items-center justify-center">
            {artwork.mode === "flow" && artwork.svgContent && !artwork.upscaledImageUrl ? (
              <div className="max-w-full max-h-full" dangerouslySetInnerHTML={{ __html: artwork.svgContent }} />
            ) : (
              <img
                src={artwork.upscaledImageUrl || artwork.imageUrl}
                alt={artwork.title}
                className="max-w-full max-h-full object-contain"
              />
            )}

            {/* Close button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Sidebar */}
          <div className="bg-background border-l flex flex-col">
            {/* Header */}
            <div className="p-6 border-b">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{artwork.title}</h2>
                  {artwork.description && <p className="text-sm text-muted-foreground">{artwork.description}</p>}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleToggleFavorite}
                  disabled={loading}
                  className="flex-1 bg-transparent"
                >
                  <Heart className={`h-4 w-4 mr-2 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                  {artwork.isFavorite ? "Unfavorite" : "Favorite"}
                </Button>
                <Button size="sm" variant="outline" onClick={handleDownload}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDelete}
                  disabled={loading}
                  className="text-red-600 hover:text-red-700 bg-transparent"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Metadata */}
            <div className="flex-1 p-6 space-y-6 overflow-y-auto">
              {/* Basic Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Palette className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Type & Dataset</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant={artwork.mode === "ai" ? "default" : "outline"}>
                    {artwork.mode === "ai" ? "🤖 AI Generated" : "📊 Flow Visualization"}
                  </Badge>
                  <Badge variant="outline">{artwork.dataset}</Badge>
                  {artwork.scenario && <Badge variant="outline">{artwork.scenario}</Badge>}
                  {artwork.upscaledImageUrl && (
                    <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                      <Sparkles className="w-3 h-3 mr-1" />
                      Enhanced
                    </Badge>
                  )}
                </div>
              </div>

              <Separator />

              {/* Generation Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Settings className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Generation Details</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Seed</span>
                    <div className="flex items-center gap-2">
                      <code className="text-sm bg-muted px-2 py-1 rounded">{artwork.seed}</code>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(artwork.seed.toString(), "Seed")}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">Tags</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {artwork.tags.map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Separator />
                </>
              )}

              {/* Timestamps */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Created</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  {artwork.createdAt ? new Date(artwork.createdAt).toLocaleString() : "Unknown"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
