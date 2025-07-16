"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Heart, Download, Trash2, Eye, Brain, Dna, Atom, Microscope, Sparkles, Zap } from "lucide-react"
import { GalleryService, type ArtworkData } from "@/lib/gallery-service"
import { GalleryViewer } from "./gallery-viewer"

interface GalleryGridProps {
  artworks: ArtworkData[]
  onArtworkUpdate?: (artwork: ArtworkData) => void
  onArtworkDelete?: (id: string) => void
}

export function GalleryGrid({ artworks, onArtworkUpdate, onArtworkDelete }: GalleryGridProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)

  const getDatasetIcon = (dataset: string) => {
    const icons: Record<string, React.ReactNode> = {
      neural_networks: <Brain className="h-3 w-3" />,
      dna_sequences: <Dna className="h-3 w-3" />,
      quantum_fields: <Atom className="h-3 w-3" />,
      protein_folding: <Microscope className="h-3 w-3" />,
      brain_connectivity: <Brain className="h-3 w-3" />,
    }
    return icons[dataset]
  }

  const handleFavoriteToggle = async (artwork: ArtworkData) => {
    try {
      const updated = await GalleryService.updateArtwork(artwork.id!, {
        isFavorite: !artwork.isFavorite,
      })

      if (updated && onArtworkUpdate) {
        onArtworkUpdate(updated)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    }
  }

  const handleDelete = async (artwork: ArtworkData) => {
    if (!confirm("Are you sure you want to delete this artwork?")) {
      return
    }

    try {
      const success = await GalleryService.deleteArtwork(artwork.id!)
      if (success && onArtworkDelete) {
        onArtworkDelete(artwork.id!)
      }
    } catch (error) {
      console.error("Error deleting artwork:", error)
    }
  }

  const handleDownload = (artwork: ArtworkData) => {
    const imageUrl = artwork.upscaledImageUrl || artwork.imageUrl
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${artwork.title.replace(/\s+/g, "_")}_${artwork.seed}.png`
    link.click()
  }

  const handleView = (artwork: ArtworkData) => {
    setSelectedArtwork(artwork)
    setViewerOpen(true)
  }

  if (artworks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-muted-foreground">
          <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium">No artworks found</p>
          <p className="text-sm mt-2">Generate some artwork to see it here!</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {artworks.map((artwork) => (
          <Card key={artwork.id} className="group overflow-hidden hover:shadow-lg transition-shadow">
            <CardContent className="p-0">
              <div className="relative aspect-square bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
                <img
                  src={artwork.upscaledImageUrl || artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full h-full object-cover"
                />

                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => handleView(artwork)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleFavoriteToggle(artwork)}>
                      <Heart className={`h-4 w-4 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    </Button>
                    <Button size="sm" variant="secondary" onClick={() => handleDownload(artwork)}>
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(artwork)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Top badges */}
                <div className="absolute top-2 left-2 flex gap-1">
                  <Badge variant={artwork.mode === "ai" ? "default" : "outline"} className="text-xs">
                    {artwork.mode === "ai" ? (
                      <>
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </>
                    ) : (
                      <>
                        <Zap className="w-3 h-3 mr-1" />
                        Flow
                      </>
                    )}
                  </Badge>
                  {artwork.upscaledImageUrl && (
                    <Badge variant="secondary" className="text-xs">
                      Enhanced
                    </Badge>
                  )}
                </div>

                {/* Bottom right badges */}
                <div className="absolute bottom-2 right-2 flex gap-1">
                  {artwork.isFavorite && (
                    <Badge variant="destructive" className="text-xs">
                      <Heart className="w-3 h-3 mr-1 fill-current" />
                      Favorite
                    </Badge>
                  )}
                  {getDatasetIcon(artwork.dataset) && (
                    <Badge variant="outline" className="text-xs bg-white/90 dark:bg-black/90">
                      {getDatasetIcon(artwork.dataset)}
                      Scientific
                    </Badge>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-3">
                <h3 className="font-medium text-sm truncate" title={artwork.title}>
                  {artwork.title}
                </h3>
                {artwork.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{artwork.description}</p>
                )}
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-xs">
                    {artwork.dataset.replace(/_/g, " ")}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {artwork.scenario.replace(/_/g, " ")}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-2">Seed: {artwork.seed}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Viewer Modal */}
      {selectedArtwork && (
        <GalleryViewer
          artwork={selectedArtwork}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
          onArtworkUpdate={onArtworkUpdate}
          onArtworkDelete={onArtworkDelete}
        />
      )}
    </>
  )
}
