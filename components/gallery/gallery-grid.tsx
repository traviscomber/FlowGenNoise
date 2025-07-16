"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Heart, Download, Trash2, Eye, Sparkles, Brain, Dna, Atom, Microscope } from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"
import { getData } from "@/lib/data-service" // Declare the getData variable

interface GalleryGridProps {
  artworks: ArtworkData[]
  onArtworkUpdate?: () => void
  onArtworkView?: (artwork: ArtworkData) => void
}

export function GalleryGrid({ artworks, onArtworkUpdate, onArtworkView }: GalleryGridProps) {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({})

  const setLoading = (id: string, loading: boolean) => {
    setLoadingStates((prev) => ({ ...prev, [id]: loading }))
  }

  const handleToggleFavorite = async (artwork: ArtworkData) => {
    if (!artwork.id) return

    setLoading(artwork.id, true)
    const success = await galleryService.toggleFavorite(artwork.id)
    setLoading(artwork.id, false)

    if (success) {
      onArtworkUpdate?.()
    }
  }

  const handleDownload = async (artwork: ArtworkData) => {
    try {
      const imageUrl = artwork.upscaledImageUrl || artwork.imageUrl
      const isEnhanced = !!artwork.upscaledImageUrl
      const fileName = `${artwork.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${artwork.seed}${isEnhanced ? "_enhanced" : ""}.png`

      if (imageUrl.startsWith("data:") || imageUrl.startsWith("blob:")) {
        // Direct download for data URLs and blob URLs
        const link = document.createElement("a")
        link.href = imageUrl
        link.download = fileName
        link.style.display = "none"
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
      } else {
        // For external URLs, fetch and convert to blob
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

        // Clean up
        setTimeout(() => URL.revokeObjectURL(blobUrl), 100)
      }
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try right-clicking and saving the image.")
    }
  }

  const handleDelete = async (artwork: ArtworkData) => {
    if (!artwork.id) return

    if (!confirm(`Are you sure you want to delete "${artwork.title}"?`)) return

    setLoading(artwork.id, true)
    const success = await galleryService.deleteArtwork(artwork.id)
    setLoading(artwork.id, false)

    if (success) {
      onArtworkUpdate?.()
    } else {
      alert("Failed to delete artwork. Please try again.")
    }
  }

  const getDatasetIcon = (dataset: string) => {
    const icons = {
      neural_networks: <Brain className="h-3 w-3" />,
      dna_sequences: <Dna className="h-3 w-3" />,
      quantum_fields: <Atom className="h-3 w-3" />,
      protein_folding: <Microscope className="h-3 w-3" />,
      brain_connectivity: <Brain className="h-3 w-3" />,
    }
    return icons[dataset as keyof typeof icons] || null
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-400 mb-4">
          <Eye className="h-16 w-16 mx-auto opacity-50" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No artworks found</h3>
        <p className="text-gray-500 dark:text-gray-400">
          Try adjusting your filters or create some new artwork to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {artworks.map((artwork) => (
        <Card key={artwork.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative">
              {/* Image */}
              <div className="aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                {artwork.mode === "flow" && artwork.svgContent && !artwork.upscaledImageUrl ? (
                  <div
                    className="w-full h-full flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: artwork.svgContent }}
                  />
                ) : (
                  <img
                    src={artwork.upscaledImageUrl || artwork.imageUrl}
                    alt={artwork.title}
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() => onArtworkView?.(artwork)}
                  />
                )}
              </div>

              {/* Overlay with actions */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => onArtworkView?.(artwork)}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleToggleFavorite(artwork)}
                  disabled={loadingStates[artwork.id || ""] || !artwork.id}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Heart className={`h-4 w-4 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDownload(artwork)}
                  className="bg-white/90 hover:bg-white text-black"
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => handleDelete(artwork)}
                  disabled={loadingStates[artwork.id || ""] || !artwork.id}
                  className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Top badges */}
              <div className="absolute top-2 left-2 flex gap-1">
                <Badge variant={artwork.mode === "ai" ? "default" : "outline"} className="text-xs">
                  {artwork.mode === "ai" ? "🤖 AI" : "📊 Flow"}
                </Badge>
                {artwork.isFavorite && (
                  <Badge className="bg-red-500 text-white text-xs">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Favorite
                  </Badge>
                )}
              </div>

              {/* Bottom badges */}
              <div className="absolute bottom-2 right-2 flex gap-1">
                {artwork.upscaledImageUrl && (
                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
                {getData && (
                  <Badge variant="outline" className="text-xs bg-white/90">
                    {getDatasetIcon(artwork.dataset)}
                  </Badge>
                )}
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="font-semibold text-sm mb-1 line-clamp-1" title={artwork.title}>
                {artwork.title}
              </h3>

              {artwork.description && (
                <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 line-clamp-2" title={artwork.description}>
                  {artwork.description}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
                <span className="capitalize">{artwork.dataset}</span>
                <span>Seed: {artwork.seed}</span>
              </div>

              {artwork.tags && artwork.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {artwork.tags.slice(0, 3).map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs px-1 py-0">
                      {tag}
                    </Badge>
                  ))}
                  {artwork.tags.length > 3 && (
                    <Badge variant="outline" className="text-xs px-1 py-0">
                      +{artwork.tags.length - 3}
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
