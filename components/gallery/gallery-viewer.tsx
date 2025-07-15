"use client"

import { useState } from "react"
import { X, Download, Heart, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { toast } from "@/hooks/use-toast"
import type { GalleryItem } from "@/lib/gallery-service"
import { GalleryService } from "@/lib/gallery-service"

interface GalleryViewerProps {
  item: GalleryItem | null
  onClose: () => void
  onItemUpdate: (item: GalleryItem) => void
}

export function GalleryViewer({ item, onClose, onItemUpdate }: GalleryViewerProps) {
  const [loading, setLoading] = useState(false)

  if (!item) return null

  const handleToggleFavorite = async () => {
    setLoading(true)
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
      setLoading(false)
    }
  }

  const handleDownload = async () => {
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

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} copied to clipboard`,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex">
        {/* Image Section */}
        <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
          <div className="relative max-w-full max-h-full">
            <img
              src={item.upscaled_image_url || item.image_url}
              alt={item.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />
            {item.upscaled_image_url && <Badge className="absolute top-2 right-2 bg-green-500">Enhanced</Badge>}
          </div>
        </div>

        {/* Info Section */}
        <div className="w-96 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <h2 className="text-xl font-semibold truncate">{item.title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Actions */}
            <div className="flex gap-2">
              <Button onClick={handleDownload} className="flex-1">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button variant="outline" onClick={handleToggleFavorite} disabled={loading}>
                <Heart className={`w-4 h-4 ${item.is_favorite ? "text-red-500 fill-current" : ""}`} />
              </Button>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <h3 className="font-medium mb-2">Description</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            )}

            {/* Tags */}
            <div>
              <h3 className="font-medium mb-2">Tags</h3>
              <div className="flex flex-wrap gap-1">
                {item.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            <Separator />

            {/* Generation Parameters */}
            <div>
              <h3 className="font-medium mb-3">Generation Parameters</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Mode:</span>
                  <Badge variant={item.mode === "ai" ? "default" : "secondary"}>{item.mode.toUpperCase()}</Badge>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Dataset:</span>
                  <span className="text-sm font-mono">{item.generation_params.dataset}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Scenario:</span>
                  <span className="text-sm font-mono">{item.generation_params.scenario}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Points:</span>
                  <span className="text-sm font-mono">{item.generation_params.numSamples}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Seed:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono">{item.generation_params.seed}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(item.generation_params.seed.toString(), "Seed")}
                    >
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {item.custom_prompt && (
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-gray-600">Custom Prompt:</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.custom_prompt!, "Custom prompt")}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-mono bg-gray-50 p-2 rounded text-wrap break-words">
                      {item.custom_prompt}
                    </p>
                  </div>
                )}

                {item.upscale_method && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Enhancement:</span>
                    <span className="text-sm font-mono">{item.upscale_method}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            {/* Metadata */}
            <div>
              <h3 className="font-medium mb-3">Metadata</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Created:</span>
                  <span>{new Date(item.created_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Updated:</span>
                  <span>{new Date(item.updated_at).toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>ID:</span>
                  <span className="font-mono text-xs">{item.id}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
