"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Download, Edit, Trash2, Eye, Sparkles } from "lucide-react"
import type { GalleryItem } from "@/lib/gallery-service"
import { cn } from "@/lib/utils"

interface GalleryGridProps {
  items: GalleryItem[]
  onItemClick: (item: GalleryItem) => void
  onFavoriteToggle: (id: string) => void
  onEdit: (item: GalleryItem) => void
  onDelete: (id: string) => void
  onDownload: (item: GalleryItem) => void
  loading?: boolean
}

export function GalleryGrid({
  items,
  onItemClick,
  onFavoriteToggle,
  onEdit,
  onDelete,
  onDownload,
  loading = false,
}: GalleryGridProps) {
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())

  const handleImageError = (itemId: string) => {
    setImageErrors((prev) => new Set(prev).add(itemId))
  }

  const handleDownload = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    onDownload(item)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <div className="aspect-square bg-gray-200 animate-pulse" />
            <CardContent className="p-4">
              <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Sparkles className="w-16 h-16 mx-auto" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">No artworks yet</h3>
        <p className="text-gray-500">Start creating some beautiful art to see it here!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {items.map((item) => (
        <Card
          key={item.id}
          className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
          onClick={() => onItemClick(item)}
        >
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            {!imageErrors.has(item.id) ? (
              <img
                src={item.upscaled_image_url || item.image_url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
                onError={() => handleImageError(item.id)}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">Image not available</span>
              </div>
            )}

            {/* Overlay with actions */}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onItemClick(item)
                  }}
                >
                  <Eye className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary" onClick={(e) => handleDownload(item, e)}>
                  <Download className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={(e) => {
                    e.stopPropagation()
                    onFavoriteToggle(item.id)
                  }}
                >
                  <Heart className={cn("w-4 h-4", item.is_favorite && "fill-red-500 text-red-500")} />
                </Button>
              </div>
            </div>

            {/* Badges */}
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
                <Heart className="w-5 h-5 fill-red-500 text-red-500" />
              </div>
            )}
          </div>

          <CardContent className="p-4">
            <h3 className="font-medium text-sm mb-1 truncate" title={item.title}>
              {item.title}
            </h3>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{item.description || "No description"}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-2">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs px-1 py-0">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
              <div className="flex gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit(item)
                  }}
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(item.id)
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
