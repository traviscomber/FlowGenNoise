"use client"

import { useState } from "react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Heart, Download, Trash2, X, Copy, Calendar, Tag, Settings, Sparkles } from "lucide-react"
import { type GalleryItem, galleryService } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

interface GalleryViewerProps {
  item: GalleryItem
  onClose: () => void
  onUpdate?: (item: GalleryItem) => void
  onDelete?: (id: string) => void
}

export function GalleryViewer({ item, onClose, onUpdate, onDelete }: GalleryViewerProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleToggleFavorite = async () => {
    setIsLoading(true)
    const success = await galleryService.toggleFavorite(item.id)

    if (success) {
      const updatedItem = { ...item, is_favorite: !item.is_favorite }
      onUpdate?.(updatedItem)
      toast({
        title: item.is_favorite ? "Removed from favorites" : "Added to favorites",
        description: `"${item.title}" has been ${item.is_favorite ? "removed from" : "added to"} your favorites.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to update favorite status.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete "${item.title}"?`)) {
      return
    }

    setIsLoading(true)
    const success = await galleryService.deleteArtwork(item.id)

    if (success) {
      onDelete?.(item.id)
      toast({
        title: "Artwork deleted",
        description: `"${item.title}" has been deleted from your gallery.`,
      })
    } else {
      toast({
        title: "Error",
        description: "Failed to delete artwork.",
        variant: "destructive",
      })
    }
    setIsLoading(false)
  }

  const handleDownload = async () => {
    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: `Downloading "${item.title}"`,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download the artwork.",
        variant: "destructive",
      })
    }
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({
        title: "Copied to clipboard",
        description: `${label} copied to clipboard.`,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard.",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={true} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex h-full">
          {/* Image Section */}
          <div className="flex-1 bg-black flex items-center justify-center p-4">
            <img
              src={item.upscaled_image_url || item.image_url}
              alt={item.title}
              className="max-w-full max-h-full object-contain"
            />
          </div>

          {/* Sidebar */}
          <div className="w-80 border-l bg-background flex flex-col">
            {/* Header */}
            <div className="p-4 border-b">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-lg font-semibold mb-1">{item.title}</h2>
                  <div className="flex gap-2">
                    <Badge variant={item.mode === "ai" ? "default" : "secondary"}>{item.mode.toUpperCase()}</Badge>
                    {item.upscaled_image_url && <Badge variant="outline">Enhanced</Badge>}
                    {item.is_favorite && (
                      <Badge variant="destructive">
                        <Heart className="h-3 w-3 fill-current mr-1" />
                        Favorite
                      </Badge>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-4">
                {/* Description */}
                {item.description && (
                  <div>
                    <h3 className="text-sm font-medium mb-2">Description</h3>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Tags
                    </h3>
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
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
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Generation Parameters
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dataset:</span>
                      <span className="font-mono">{item.dataset}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenario:</span>
                      <span className="font-mono">{item.scenario}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seed:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono">{item.seed}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.seed.toString(), "Seed")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Samples:</span>
                      <span className="font-mono">{item.num_samples}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Noise Scale:</span>
                      <span className="font-mono">{item.noise_scale}</span>
                    </div>
                    {item.time_step && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Time Step:</span>
                        <span className="font-mono">{item.time_step}</span>
                      </div>
                    )}
                    {item.upscale_method && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Upscale Method:</span>
                        <span className="font-mono">{item.upscale_method}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Prompt */}
                {item.custom_prompt && (
                  <div>
                    <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      Custom Prompt
                    </h3>
                    <div className="bg-muted p-3 rounded-md">
                      <p className="text-sm font-mono">{item.custom_prompt}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(item.custom_prompt!, "Custom prompt")}
                        className="mt-2 h-6 text-xs"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy Prompt
                      </Button>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Metadata */}
                <div>
                  <h3 className="text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Metadata
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(item.created_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Updated:</span>
                      <span>{new Date(item.updated_at).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">ID:</span>
                      <div className="flex items-center gap-1">
                        <span className="font-mono text-xs">{item.id.slice(0, 8)}...</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(item.id, "Artwork ID")}
                          className="h-6 w-6 p-0"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>

            {/* Actions */}
            <div className="p-4 border-t">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToggleFavorite}
                  disabled={isLoading}
                  className="flex-1 bg-transparent"
                >
                  <Heart className={`h-4 w-4 mr-2 ${item.is_favorite ? "fill-current" : ""}`} />
                  {item.is_favorite ? "Unfavorite" : "Favorite"}
                </Button>
                <Button variant="outline" size="sm" onClick={handleDownload} className="flex-1 bg-transparent">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isLoading}
                className="w-full mt-2"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Artwork
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
