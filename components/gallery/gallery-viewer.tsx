"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Separator } from "@/components/ui/separator"
import {
  Heart,
  Download,
  Trash2,
  X,
  Copy,
  Sparkles,
  Brain,
  Dna,
  Atom,
  Microscope,
  Calendar,
  Settings,
  Tag,
} from "lucide-react"
import { galleryService, type ArtworkData } from "@/lib/gallery-service"

interface GalleryViewerProps {
  artwork: ArtworkData | null
  isOpen: boolean
  onClose: () => void
  onArtworkUpdate?: () => void
}

export function GalleryViewer({ artwork, isOpen, onClose, onArtworkUpdate }: GalleryViewerProps) {
  const [isLoading, setIsLoading] = useState(false)

  if (!artwork) return null

  const handleToggleFavorite = async () => {
    if (!artwork.id) return

    setIsLoading(true)
    const success = await galleryService.toggleFavorite(artwork.id)
    setIsLoading(false)

    if (success) {
      onArtworkUpdate?.()
    }
  }

  const handleDownload = async () => {
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
    } catch (error) {
      console.error("Download failed:", error)
      alert("Download failed. Please try right-clicking and saving the image.")
    }
  }

  const handleDelete = async () => {
    if (!artwork.id) return

    if (!confirm(`Are you sure you want to delete "${artwork.title}"?`)) return

    setIsLoading(true)
    const success = await galleryService.deleteArtwork(artwork.id)
    setIsLoading(false)

    if (success) {
      onClose()
      onArtworkUpdate?.()
    } else {
      alert("Failed to delete artwork. Please try again.")
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert(`${label} copied to clipboard!`)
      })
      .catch(() => {
        alert("Failed to copy to clipboard")
      })
  }

  const getDatasetIcon = (dataset: string) => {
    const icons = {
      neural_networks: <Brain className="h-4 w-4" />,
      dna_sequences: <Dna className="h-4 w-4" />,
      quantum_fields: <Atom className="h-4 w-4" />,
      protein_folding: <Microscope className="h-4 w-4" />,
      brain_connectivity: <Brain className="h-4 w-4" />,
    }
    return icons[dataset as keyof typeof icons] || null
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 h-full">
          {/* Image Section */}
          <div className="lg:col-span-2 relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="absolute top-4 right-4 z-10 bg-white/80 hover:bg-white dark:bg-black/80 dark:hover:bg-black"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-center justify-center h-full p-8">
              {artwork.mode === "flow" && artwork.svgContent && !artwork.upscaledImageUrl ? (
                <div className="max-w-full max-h-full" dangerouslySetInnerHTML={{ __html: artwork.svgContent }} />
              ) : (
                <img
                  src={artwork.upscaledImageUrl || artwork.imageUrl}
                  alt={artwork.title}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              )}
            </div>

            {/* Image badges */}
            <div className="absolute top-4 left-4 flex gap-2">
              <Badge variant={artwork.mode === "ai" ? "default" : "outline"}>
                {artwork.mode === "ai" ? "🤖 AI Generated" : "📊 Flow Field"}
              </Badge>
              {artwork.upscaledImageUrl && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Sparkles className="w-4 h-4 mr-1" />
                  Enhanced
                </Badge>
              )}
              {artwork.isFavorite && (
                <Badge className="bg-red-500 text-white">
                  <Heart className="w-4 h-4 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="bg-white dark:bg-gray-900 border-l overflow-y-auto">
            <div className="p-6 space-y-6">
              {/* Title and Actions */}
              <div>
                <h1 className="text-2xl font-bold mb-2">{artwork.title}</h1>
                {artwork.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{artwork.description}</p>
                )}

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleToggleFavorite}
                    disabled={isLoading || !artwork.id}
                    className="flex-1 bg-transparent"
                  >
                    <Heart className={`h-4 w-4 mr-2 ${artwork.isFavorite ? "fill-red-500 text-red-500" : ""}`} />
                    {artwork.isFavorite ? "Unfavorite" : "Favorite"}
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleDownload} className="flex-1 bg-transparent">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleDelete}
                    disabled={isLoading || !artwork.id}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 bg-transparent"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Generation Parameters */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Generation Parameters
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Dataset:</span>
                      <div className="flex items-center gap-2 mt-1">
                        {getDatasetIcon(artwork.dataset)}
                        <span className="font-medium capitalize">{artwork.dataset.replace(/_/g, " ")}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Scenario:</span>
                      <p className="font-medium capitalize mt-1">{artwork.scenario.replace(/_/g, " ")}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Seed:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-medium">{artwork.seed}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(artwork.seed.toString(), "Seed")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Mode:</span>
                      <p className="font-medium mt-1">{artwork.mode === "ai" ? "AI Generated" : "Flow Field"}</p>
                    </div>
                  </div>

                  {artwork.mode === "flow" && (
                    <div className="grid grid-cols-2 gap-4 text-sm pt-2 border-t">
                      {artwork.numSamples && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Samples:</span>
                          <p className="font-medium mt-1">{artwork.numSamples}</p>
                        </div>
                      )}
                      {artwork.noiseScale && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Noise Scale:</span>
                          <p className="font-medium mt-1">{artwork.noiseScale.toFixed(3)}</p>
                        </div>
                      )}
                      {artwork.timeStep && (
                        <div>
                          <span className="text-gray-600 dark:text-gray-400">Time Step:</span>
                          <p className="font-medium mt-1">{artwork.timeStep.toFixed(3)}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {artwork.upscaleMethod && (
                    <div className="pt-2 border-t">
                      <span className="text-gray-600 dark:text-gray-400 text-sm">Upscale Method:</span>
                      <p className="font-medium mt-1 text-sm">{artwork.upscaleMethod}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Prompt */}
              {artwork.customPrompt && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Sparkles className="h-5 w-5" />
                      AI Prompt
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="relative">
                      <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">{artwork.customPrompt}</p>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => copyToClipboard(artwork.customPrompt!, "Prompt")}
                        className="absolute top-0 right-0 h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {artwork.tags && artwork.tags.length > 0 && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Tag className="h-5 w-5" />
                      Tags
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {artwork.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Metadata
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {artwork.createdAt && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Created:</span>
                      <p className="font-medium mt-1">{formatDate(artwork.createdAt)}</p>
                    </div>
                  )}
                  {artwork.updatedAt && artwork.updatedAt !== artwork.createdAt && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Updated:</span>
                      <p className="font-medium mt-1">{formatDate(artwork.updatedAt)}</p>
                    </div>
                  )}
                  {artwork.id && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">ID:</span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-xs">{artwork.id.slice(0, 8)}...</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(artwork.id!, "Artwork ID")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
