"use client"

import type React from "react"

import { useState } from "react"
import { Heart, Download, Eye, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "@/hooks/use-toast"
import type { GalleryItem } from "@/lib/gallery-service"
import { GalleryService } from "@/lib/gallery-service"

interface GalleryGridProps {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
  onItemUpdate: (item: GalleryItem) => void
  onItemDelete: (id: string) => void
}

export function GalleryGrid({ items, onItemClick, onItemUpdate, onItemDelete }: GalleryGridProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: loading }))
  }

  const handleToggleFavorite = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    setLoading(item.id, true)

    try {
      const updated = await GalleryService.toggleFavorite(item.id)
      onItemUpdate(updated)
      toast({
        title: updated.is_favorite ? "Added to favorites" : "Removed from favorites",
        description: `"${item.title}" has been ${updated.is_favorite ? "added to" : "removed from"} your favorites.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    } finally {
      setLoading(item.id, false)
    }
  }

  const handleDownload = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()

    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const a = document.createElement("a")
      a.href = url
      a.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.${item.mode === "svg" ? "svg" : "png"}`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading "${item.title}"`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the image",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      return
    }

    setLoading(item.id, true)

    try {
      await GalleryService.deleteArtwork(item.id)
      onItemDelete(item.id)
      toast({
        title: "Artwork deleted",
        description: `"${item.title}" has been deleted from your gallery.`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete artwork",
        variant: "destructive",
      })
    } finally {
      setLoading(item.id, false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">No artworks found</div>
        <div className="text-gray-400">Create some art to see it here!</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group cursor-pointer hover:shadow-lg transition-all duration-200 overflow-hidden"
          onClick={() => onItemClick(item)}
        >
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <img
                src={item.upscaled_image_url || item.image_url}
                alt={item.title}
                className="w-full h-full object-cover"
              />

              {/* Overlay with badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={item.mode === "ai" ? "default" : "secondary"} className="text-xs">
                  {item.mode.toUpperCase()}
                </Badge>
                {item.upscaled_image_url && (
                  <Badge variant="outline" className="text-xs bg-white/90">
                    Enhanced
                  </Badge>
                )}
              </div>

              {/* Favorite indicator */}
              {item.is_favorite && (
                <div className="absolute top-2 right-2">
                  <Heart className="w-4 h-4 text-red-500 fill-current" />
                </div>
              )}

              {/* Hover overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => {
                      e.stopPropagation()
                      onItemClick(item)
                    }}
                    disabled={loadingStates[item.id]}
                  >
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleDownload(item, e)}
                    disabled={loadingStates[item.id]}
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleToggleFavorite(item, e)}
                    disabled={loadingStates[item.id]}
                  >
                    <Heart className={`w-4 h-4 ${item.is_favorite ? "text-red-500 fill-current" : ""}`} />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={(e) => handleDelete(item, e)}
                    disabled={loadingStates[item.id]}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Item info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1 truncate">{item.title}</h3>
              {item.description && <p className="text-xs text-gray-600 mb-2 line-clamp-2">{item.description}</p>}
              <div className="flex flex-wrap gap-1 mb-2">
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
              <div className="text-xs text-gray-500">{new Date(item.created_at).toLocaleDateString()}</div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
