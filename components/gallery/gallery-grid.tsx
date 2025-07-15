"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Heart, Download, Trash2, Edit, Sparkles, Calendar, Tag, MoreVertical } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { GalleryService, type GalleryItem } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface GalleryGridProps {
  searchTerm?: string
  mode?: "svg" | "ai"
  favoritesOnly?: boolean
  onItemClick?: (item: GalleryItem) => void
  onItemEdit?: (item: GalleryItem) => void
  onItemDelete?: (item: GalleryItem) => void
  refreshTrigger?: number
}

export function GalleryGrid({
  searchTerm,
  mode,
  favoritesOnly,
  onItemClick,
  onItemEdit,
  onItemDelete,
  refreshTrigger,
}: GalleryGridProps) {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const { toast } = useToast()

  const loadItems = async (offset = 0, append = false) => {
    try {
      if (offset === 0) setLoading(true)
      else setLoadingMore(true)

      const result = await GalleryService.getGalleryItems({
        limit: 12,
        offset,
        mode,
        favoritesOnly,
        searchTerm,
      })

      if (append) {
        setItems((prev) => [...prev, ...result.items])
      } else {
        setItems(result.items)
      }

      setHasMore(result.items.length === 12)
      setError(null)
    } catch (err: any) {
      setError(err.message)
      toast({
        title: "Failed to load gallery",
        description: err.message,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    loadItems()
  }, [searchTerm, mode, favoritesOnly, refreshTrigger])

  const handleLoadMore = () => {
    loadItems(items.length, true)
  }

  const handleToggleFavorite = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await GalleryService.toggleFavorite(item.id)
      setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, is_favorite: !i.is_favorite } : i)))
      toast({
        title: item.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: `"${item.title}" ${item.is_favorite ? "removed from" : "added to"} your favorites.`,
      })
    } catch (err: any) {
      toast({
        title: "Failed to update favorite",
        description: err.message,
        variant: "destructive",
      })
    }
  }

  const handleDownload = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const isEnhanced = !!item.upscaled_image_url
      const fileName = `${item.title.replace(/[^a-zA-Z0-9]/g, "-")}-${item.id.slice(0, 8)}${isEnhanced ? "-enhanced" : ""}.png`

      // Create download link
      const link = document.createElement("a")
      link.href = imageUrl
      link.download = fileName
      link.target = "_blank"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Download started",
        description: `Downloading "${item.title}"`,
      })
    } catch (err: any) {
      toast({
        title: "Download failed",
        description: "Could not download the image. Please try right-clicking and saving.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onItemDelete) {
      onItemDelete(item)
    }
  }

  const handleEdit = async (item: GalleryItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onItemEdit) {
      onItemEdit(item)
    }
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="overflow-hidden">
            <Skeleton className="h-48 w-full" />
            <CardContent className="p-4">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2 mb-3" />
              <div className="flex gap-1">
                <Skeleton className="h-5 w-12" />
                <Skeleton className="h-5 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    )
  }

  if (items.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 dark:text-gray-400">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">No artworks found</p>
          <p className="text-sm">
            {searchTerm
              ? `No results for "${searchTerm}"`
              : favoritesOnly
                ? "No favorites yet"
                : "Start creating some amazing art!"}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {items.map((item) => (
          <Card
            key={item.id}
            className="group overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            onClick={() => onItemClick?.(item)}
          >
            <div className="relative">
              <img
                src={item.upscaled_image_url || item.image_url}
                alt={item.title}
                className="w-full h-48 object-cover"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200" />

              {/* Overlay badges */}
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
              </div>

              {/* Action buttons */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="secondary" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => handleDownload(item, e)}>
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={(e) => handleEdit(item, e)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={(e) => handleDelete(item, e)} className="text-red-600 dark:text-red-400">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Favorite button */}
              <Button
                size="sm"
                variant="secondary"
                className={`absolute bottom-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                  item.is_favorite ? "text-red-500" : ""
                }`}
                onClick={(e) => handleToggleFavorite(item, e)}
              >
                <Heart className={`h-4 w-4 ${item.is_favorite ? "fill-current" : ""}`} />
              </Button>
            </div>

            <CardContent className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{item.title}</h3>
              {item.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">{item.description}</p>
              )}

              <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
              </div>

              <div className="flex flex-wrap gap-1 mb-2">
                <Badge variant="outline" className="text-xs">
                  {item.generation_params.dataset}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {item.generation_params.scenario}
                </Badge>
                {item.custom_prompt && (
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">Custom</Badge>
                )}
              </div>

              {item.tags.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Tag className="h-3 w-3" />
                  <span className="line-clamp-1">
                    {item.tags.slice(0, 3).join(", ")}
                    {item.tags.length > 3 && ` +${item.tags.length - 3}`}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="text-center">
          <Button onClick={handleLoadMore} disabled={loadingMore} variant="outline">
            {loadingMore ? (
              <>
                <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                Loading more...
              </>
            ) : (
              "Load More"
            )}
          </Button>
        </div>
      )}
    </div>
  )
}
