"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Download, Trash2, Eye, Sparkles } from "lucide-react"
import { type GalleryItem, galleryService } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"
import { GalleryViewer } from "./gallery-viewer"

interface GalleryGridProps {
  items: GalleryItem[]
  onItemUpdate?: (item: GalleryItem) => void
  onItemDelete?: (id: string) => void
}

export function GalleryGrid({ items, onItemUpdate, onItemDelete }: GalleryGridProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: loading }))
  }

  const handleToggleFavorite = async (item: GalleryItem) => {
    setLoading(item.id, true)
    const success = await galleryService.toggleFavorite(item.id)

    if (success) {
      const updatedItem = { ...item, is_favorite: !item.is_favorite }
      onItemUpdate?.(updatedItem)
      toast({
        title: item.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: `"${item.title}" has been ${item.is_favorite ? "removed from" : "added to"} your favorites.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      })
    }
    setLoading(item.id, false)
  }

  const handleDelete = async (item: GalleryItem) => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return
    }

    setLoading(item.id, true)
    const success = await galleryService.deleteArtwork(item.id)

    if (success) {
      onItemDelete?.(item.id)
      toast({
        title: "Artwork deleted",
        description: `"${item.title}" has been deleted from your gallery.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete artwork.",
        variant: "destructive",
      })
    }
    setLoading(item.id, false)
  }

  const handleDownload = async (item: GalleryItem) => {
    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading "${item.title}"`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the artwork.",
        variant: "destructive",
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No artwork found</h3>
          <p>Start creating some amazing art to see it here!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {items.map((item) => (
          <Card key={item.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <div className="relative aspect-square">
              <img
                src={item.upscaled_image_url || item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="sm" variant="secondary" onClick={() => setSelectedItem(item)} className="h-8 w-8 p-0">
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleToggleFavorite(item)}
                  disabled={loadingStates[item.id]}
                  className="h-8 w-8 p-0"
                >
                  <Heart className={`h-4 w-4 ${item.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button size="sm" variant="secondary" onClick={() => handleDownload(item)} className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => handleDelete(item)}
                  disabled={loadingStates[item.id]}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={item.mode === "ai" ? "default" : "secondary"} className="text-xs">
                  {item.mode.toUpperCase()}
                </Badge>
                {item.upscaled_image_url && (
                  <Badge variant="outline" className="text-xs">
                    Enhanced
                  </Badge>
                )}
                {item.is_favorite && (
                  <Badge variant="destructive" className="text-xs">
                    <Heart className="h-3 w-3 fill-current" />
                  </Badge>
                )}
              </div>
            </div>

            <CardContent className="p-4">
              <h3 className="font-medium truncate mb-1">{item.title}</h3>
              {item.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{item.description}</p>
              )}

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{item.dataset}</span>
                <span>{new Date(item.created_at).toLocaleDateString()}</span>
              </div>

              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {item.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {item.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{item.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Gallery Viewer Modal */}
      {selectedItem && (
        <GalleryViewer
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onUpdate={onItemUpdate}
          onDelete={(id) => {
            onItemDelete?.(id)
            setSelectedItem(null)
          }}
        />
      )}
    </>
  )
}
