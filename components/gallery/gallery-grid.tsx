"use client"

import type React from "react"
import Image from "next/image"
import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Brain, Dna, Atom, Microscope, Sparkles } from "lucide-react"
import { GalleryService, type GalleryArtwork } from "@/lib/gallery-service"
import { GalleryViewer } from "./gallery-viewer"
import { format } from "date-fns"

interface GalleryGridProps {
  artworks: GalleryArtwork[]
  onSelectArtwork?: (artwork: GalleryArtwork) => void
  onArtworkUpdate?: (artwork: GalleryArtwork) => void
  onArtworkDelete?: (id: string) => void
}

export function GalleryGrid({ artworks, onSelectArtwork, onArtworkUpdate, onArtworkDelete }: GalleryGridProps) {
  const [selectedArtwork, setSelectedArtwork] = useState<GalleryArtwork | null>(null)
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

  const handleFavoriteToggle = async (artwork: GalleryArtwork) => {
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

  const handleDelete = async (artwork: GalleryArtwork) => {
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

  const handleDownload = (artwork: GalleryArtwork) => {
    const imageUrl = artwork.imageUrl
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${artwork.name.replace(/\s+/g, "_")}_${artwork.seed}.png`
    link.click()
  }

  const handleView = (artwork: GalleryArtwork) => {
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {artworks.map((artwork) => (
          <Card
            key={artwork.id}
            className="overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer"
            onClick={() => onSelectArtwork && onSelectArtwork(artwork)}
          >
            <CardContent className="p-0">
              <div className="relative w-full aspect-square">
                <Image
                  src={artwork.imageUrl || "/placeholder.svg"}
                  alt={artwork.name || "Generated Artwork"}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 hover:scale-105"
                />
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 truncate">{artwork.name}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{artwork.description}</p>
                <p className="text-xs text-gray-400 mt-2">{format(new Date(artwork.created_at), "PPP")}</p>
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
