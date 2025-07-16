"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Download, Trash2, Eye, Sparkles } from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface GalleryGridProps {
  artworks: ArtworkData[]
  onArtworkUpdate?: () => void
  onArtworkView?: (artwork: ArtworkData) => void
}

export function GalleryGrid({ artworks, onArtworkUpdate, onArtworkView }: GalleryGridProps) {
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const handleToggleFavorite = async (artwork: ArtworkData) => {
    if (!artwork.id) return

    setLoadingActions((prev) => ({ ...prev, [artwork.id!]: true }))

    const success = await galleryService.toggleFavorite(artwork.id)

    setLoadingActions((prev) => ({ ...prev, [artwork.id!]: false }))

    if (success) {
      onArtworkUpdate?.()
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

  const handleDownload = async (artwork: ArtworkData) => {
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

  const handleDelete = async (artwork: ArtworkData) => {
    if (!artwork.id) return

    if (!confirm(`Are you sure you want to delete "${artwork.title}"?`)) return

    setLoadingActions((prev) => ({ ...prev, [artwork.id!]: true }))

    const success = await galleryService.deleteArtwork(artwork.id)

    setLoadingActions((prev) => ({ ...prev, [artwork.id!]: false }))

    if (success) {
      onArtworkUpdate?.()
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

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground mb-4">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg">No artworks found</p>
          <p className="text-sm">Try adjusting your filters or generate some artwork first.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <div
          key={artwork.id}
          className="group relative bg-card rounded-lg overflow-hidden border hover:shadow-lg transition-all duration-200"
        >
          {/* Image */}
          <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 relative overflow-hidden">
            {artwork.mode === "flow" && artwork.svgContent && !artwork.upscaledImageUrl ? (
              <div
                className="w-full h-full flex items-center justify-center cursor-pointer"
                dangerouslySetInnerHTML={{ __html: artwork.svgContent }}
                onClick={() => onArtworkView?.(artwork)}
              />
            ) : (
              <img
                src={artwork.upscaledImageUrl || artwork.imageUrl}
                alt={artwork.title}
                className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                onClick={() => onArtworkView?.(artwork)}
              />
            )}

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button size="sm" variant="secondary" onClick={() => onArtworkView?.(artwork)}>
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleToggleFavorite(artwork)}
                disabled={loadingActions[artwork.id!]}
              >
                <Heart className={`h-4 w-4 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="sm" variant="secondary" onClick={() => handleDownload(artwork)}>
                <Download className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleDelete(artwork)}
                disabled={loadingActions[artwork.id!]}
                className="text-red-400 hover:text-red-300"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>

            {/* Badges */}
            <div className="absolute top-2 left-2 flex gap-1">
              <Badge variant={artwork.mode === "ai" ? "default" : "outline"} className="text-xs">
                {artwork.mode === "ai" ? "🤖" : "📊"}
              </Badge>
              {artwork.upscaledImageUrl && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                  <Sparkles className="w-2 h-2 mr-1" />
                </Badge>
              )}
              {artwork.isFavorite && (
                <Badge className="bg-red-500 text-white text-xs">
                  <Heart className="w-2 h-2 fill-current" />
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-2 line-clamp-2">{artwork.title}</h3>
            {artwork.description && (
              <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>
            )}

            <div className="flex flex-wrap gap-1 mb-3">
              <Badge variant="outline" className="text-xs">
                {artwork.dataset}
              </Badge>
              {artwork.scenario && (
                <Badge variant="outline" className="text-xs">
                  {artwork.scenario}
                </Badge>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Seed: {artwork.seed}</span>
              <span>{artwork.createdAt ? new Date(artwork.createdAt).toLocaleDateString() : ""}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
