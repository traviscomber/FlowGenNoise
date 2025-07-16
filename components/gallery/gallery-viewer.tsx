"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Heart,
  Download,
  Trash2,
  Copy,
  Brain,
  Dna,
  Atom,
  Microscope,
  Sparkles,
  Zap,
  Calendar,
  Tag,
  Settings,
} from "lucide-react"
import { GalleryService, type ArtworkData } from "@/lib/gallery-service"

interface GalleryViewerProps {
  artwork: ArtworkData
  open: boolean
  onOpenChange: (open: boolean) => void
  onArtworkUpdate?: (artwork: ArtworkData) => void
  onArtworkDelete?: (id: string) => void
}

export function GalleryViewer({ artwork, open, onOpenChange, onArtworkUpdate, onArtworkDelete }: GalleryViewerProps) {
  const [isUpdating, setIsUpdating] = useState(false)

  const getDatasetIcon = (dataset: string) => {
    const icons: Record<string, React.ReactNode> = {
      neural_networks: <Brain className="h-4 w-4" />,
      dna_sequences: <Dna className="h-4 w-4" />,
      quantum_fields: <Atom className="h-4 w-4" />,
      protein_folding: <Microscope className="h-4 w-4" />,
      brain_connectivity: <Brain className="h-4 w-4" />,
    }
    return icons[dataset]
  }

  const handleFavoriteToggle = async () => {
    setIsUpdating(true)
    try {
      const updated = await GalleryService.updateArtwork(artwork.id!, {
        isFavorite: !artwork.isFavorite,
      })

      if (updated && onArtworkUpdate) {
        onArtworkUpdate(updated)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this artwork?")) {
      return
    }

    setIsUpdating(true)
    try {
      const success = await GalleryService.deleteArtwork(artwork.id!)
      if (success) {
        onOpenChange(false)
        if (onArtworkDelete) {
          onArtworkDelete(artwork.id!)
        }
      }
    } catch (error) {
      console.error("Error deleting artwork:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDownload = () => {
    const imageUrl = artwork.upscaledImageUrl || artwork.imageUrl
    const link = document.createElement("a")
    link.href = imageUrl
    link.download = `${artwork.title.replace(/\s+/g, "_")}_${artwork.seed}.png`
    link.click()
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{artwork.title}</span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleFavoriteToggle} disabled={isUpdating}>
                <Heart className={`h-4 w-4 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
              </Button>
              <Button size="sm" variant="outline" onClick={handleDownload}>
                <Download className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isUpdating}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
              {artwork.mode === "flow" && artwork.svgContent && !artwork.upscaledImageUrl ? (
                <div
                  className="w-full aspect-square flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: artwork.svgContent }}
                />
              ) : (
                <img
                  src={artwork.upscaledImageUrl || artwork.imageUrl}
                  alt={artwork.title}
                  className="w-full aspect-square object-cover"
                />
              )}

              {/* Image badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                <Badge variant={artwork.mode === "ai" ? "default" : "outline"}>
                  {artwork.mode === "ai" ? (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Generated
                    </>
                  ) : (
                    <>
                      <Zap className="w-3 h-3 mr-1" />
                      Flow Field
                    </>
                  )}
                </Badge>
                {artwork.upscaledImageUrl && (
                  <Badge variant="secondary">
                    <Sparkles className="w-3 h-3 mr-1" />
                    Enhanced
                  </Badge>
                )}
                {artwork.isFavorite && (
                  <Badge variant="destructive">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Favorite
                  </Badge>
                )}
              </div>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Description */}
            {artwork.description && (
              <div>
                <h3 className="font-medium text-sm mb-2">Description</h3>
                <p className="text-sm text-muted-foreground">{artwork.description}</p>
              </div>
            )}

            {/* Tags */}
            {artwork.tags.length > 0 && (
              <div>
                <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags
                </h3>
                <div className="flex flex-wrap gap-1">
                  {artwork.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator />

            {/* Generation Parameters */}
            <div>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Generation Parameters
              </h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Mode:</span>
                  <span className="flex items-center gap-1">
                    {artwork.mode === "ai" ? <Sparkles className="w-3 h-3" /> : <Zap className="w-3 h-3" />}
                    {artwork.mode === "ai" ? "AI Art" : "Flow Field"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Dataset:</span>
                  <span className="flex items-center gap-1">
                    {getDatasetIcon(artwork.dataset)}
                    {artwork.dataset.replace(/_/g, " ")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Scenario:</span>
                  <span>{artwork.scenario.replace(/_/g, " ")}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Seed:</span>
                  <div className="flex items-center gap-1">
                    <span>{artwork.seed}</span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(artwork.seed.toString())}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                {artwork.numSamples && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Samples:</span>
                    <span>{artwork.numSamples}</span>
                  </div>
                )}
                {artwork.noiseScale && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Noise Scale:</span>
                    <span>{artwork.noiseScale.toFixed(3)}</span>
                  </div>
                )}
                {artwork.timeStep && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Time Step:</span>
                    <span>{artwork.timeStep.toFixed(3)}</span>
                  </div>
                )}
                {artwork.upscaleMethod && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Upscale Method:</span>
                    <span>{artwork.upscaleMethod}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Prompt */}
            {artwork.customPrompt && (
              <div>
                <h3 className="font-medium text-sm mb-2">Custom Prompt</h3>
                <div className="relative">
                  <p className="text-xs text-muted-foreground bg-muted p-2 rounded text-wrap break-words">
                    {artwork.customPrompt}
                  </p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyToClipboard(artwork.customPrompt!)}
                    className="absolute top-1 right-1 h-6 w-6 p-0"
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            )}

            <Separator />

            {/* Timestamps */}
            <div>
              <h3 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Timestamps
              </h3>
              <div className="space-y-1 text-xs text-muted-foreground">
                {artwork.createdAt && <div>Created: {formatDate(artwork.createdAt)}</div>}
                {artwork.updatedAt && artwork.updatedAt !== artwork.createdAt && (
                  <div>Updated: {formatDate(artwork.updatedAt)}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
