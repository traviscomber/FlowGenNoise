"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Download, Eye, Trash2, Sparkles, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { galleryService, type GalleryItem } from "@/lib/gallery-service"

interface GalleryGridProps {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
  onItemsChange: () => void
}

export function GalleryGrid({ items, onItemClick, onItemsChange }: GalleryGridProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})
  const { toast } = useToast()

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: loading }))
  }

  const handleToggleFavorite = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation()
    setLoading(item.id, true)

    try {
      await galleryService.toggleFavorite(item.id)
      toast({
        title: item.is_favorite ? "Removed from Favorites" : "Added to Favorites",
        description: `"${item.title}" ${item.is_favorite ? "removed from" : "added to"} favorites.`,
      })
      onItemsChange()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status.",
        variant: "destructive",
      })
    } finally {
      setLoading(item.id, false)
    }
  }

  const handleDownload = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation()

    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const isEnhanced = !!item.upscaled_image_url
      const fileExtension = item.mode === "svg" && !isEnhanced ? "svg" : "png"
      const fileName = `${item.title.replace(/[^a-zA-Z0-9]/g, "-")}-${item.seed}${isEnhanced ? "-enhanced" : ""}.${fileExtension}`

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
        title: "Download Complete! 🎨",
        description: `"${item.title}" downloaded successfully.`,
      })
    } catch (error) {
      toast({
        title: "Download Failed",
        description: "Could not download the image. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (e: React.MouseEvent, item: GalleryItem) => {
    e.stopPropagation()

    if (!confirm(`Are you sure you want to delete "${item.title}"? This action cannot be undone.`)) {
      return
    }

    setLoading(item.id, true)

    try {
      await galleryService.deleteArtwork(item.id)
      toast({
        title: "Artwork Deleted",
        description: `"${item.title}" has been removed from your gallery.`,
      })
      onItemsChange()
    } catch (error: any) {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete artwork.",
        variant: "destructive",
      })
    } finally {
      setLoading(item.id, false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No artworks found</p>
          <p className="text-sm mt-2">Generate some artwork to see it here!</p>
        </div>
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
            {/* Image */}
            <div className="relative aspect-square bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
              {item.mode === "svg" && item.svg_content && !item.upscaled_image_url ? (
                <div
                  className="w-full h-full flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: item.svg_content }}
                />
              ) : (
                <img
                  src={item.upscaled_image_url || item.image_url}
                  alt={item.title}
                  className="w-full h-full object-contain"
                />
              )}

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleToggleFavorite(e, item)}
                    disabled={loadingStates[item.id]}
                  >
                    <Heart className={`h-4 w-4 ${item.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="sm" variant="secondary" onClick={(e) => handleDownload(e, item)}>
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={(e) => handleDelete(e, item)}
                    disabled={loadingStates[item.id]}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={item.mode === "ai" ? "default" : "outline"} className="text-xs">
                  {item.mode === "ai" ? "🤖 AI" : "📊 SVG"}
                </Badge>
                {item.upscaled_image_url && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
                {item.custom_prompt && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
                    <Wand2 className="w-3 h-3 mr-1" />
                    Custom
                  </Badge>
                )}
              </div>

              {/* Favorite indicator */}
              {item.is_favorite && (
                <div className="absolute top-2 right-2">
                  <Heart className="h-5 w-5 fill-red-500 text-red-500" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
              )}

              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-xs">
                  {item.dataset}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.scenario}
                </Badge>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(item.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
