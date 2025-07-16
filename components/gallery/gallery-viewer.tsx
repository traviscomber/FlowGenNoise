"use client"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Heart, Download, Copy, X, Sparkles, Wand2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { galleryService, type GalleryItem } from "@/lib/gallery-service"
import { useState } from "react"

interface GalleryViewerProps {
  item: GalleryItem | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onItemChange: () => void
}

export function GalleryViewer({ item, open, onOpenChange, onItemChange }: GalleryViewerProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!item) return null

  const handleToggleFavorite = async () => {
    setLoading(true)
    try {
      await galleryService.toggleFavorite(item.id)
      toast({
        title: item.is_favorite ? "Removed from Favorites" : "Added to Favorites",
        description: `"${item.title}" ${item.is_favorite ? "removed from" : "added to"} favorites.`,
      })
      onItemChange()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorite status.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async () => {
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text.toString())
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>{item.title}</span>
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-lg overflow-hidden">
              {item.mode === "svg" && item.svg_content && !item.upscaled_image_url ? (
                <div
                  className="w-full min-h-[400px] flex items-center justify-center"
                  dangerouslySetInnerHTML={{ __html: item.svg_content }}
                />
              ) : (
                <img
                  src={item.upscaled_image_url || item.image_url}
                  alt={item.title}
                  className="w-full h-auto max-h-[600px] object-contain"
                />
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-2 mt-4">
              <Button
                onClick={handleToggleFavorite}
                disabled={loading}
                variant="outline"
                className="flex-1 bg-transparent"
              >
                <Heart className={`h-4 w-4 mr-2 ${item.is_favorite ? "fill-red-500 text-red-500" : ""}`} />
                {item.is_favorite ? "Remove from Favorites" : "Add to Favorites"}
              </Button>
              <Button onClick={handleDownload} variant="outline" className="flex-1 bg-transparent">
                <Download className="h-4 w-4 mr-2" />
                Download {item.upscaled_image_url ? "Enhanced" : "Original"}
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <div className="space-y-4">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={item.mode === "ai" ? "default" : "outline"}>
                {item.mode === "ai" ? "🤖 AI Art" : "📊 SVG"}
              </Badge>
              {item.upscaled_image_url && (
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              )}
              {item.custom_prompt && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Wand2 className="w-3 h-3 mr-1" />
                  Custom Prompt
                </Badge>
              )}
              {item.is_favorite && (
                <Badge className="bg-red-500 text-white">
                  <Heart className="w-3 h-3 mr-1 fill-current" />
                  Favorite
                </Badge>
              )}
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <Label className="text-sm font-semibold">Description</Label>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.description}</p>
              </div>
            )}

            <Separator />

            {/* Generation Parameters */}
            <div>
              <Label className="text-sm font-semibold">Generation Parameters</Label>
              <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
                <div>
                  <span className="text-gray-600">Dataset:</span>
                  <p className="font-medium capitalize">{item.dataset}</p>
                </div>
                <div>
                  <span className="text-gray-600">Scenario:</span>
                  <p className="font-medium capitalize">{item.scenario}</p>
                </div>
                <div>
                  <span className="text-gray-600">Seed:</span>
                  <div className="flex items-center gap-1">
                    <p className="font-medium">{item.seed}</p>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(item.seed.toString(), "Seed")}
                      className="h-6 w-6 p-0"
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Samples:</span>
                  <p className="font-medium">{item.num_samples}</p>
                </div>
                <div>
                  <span className="text-gray-600">Noise:</span>
                  <p className="font-medium">{item.noise_scale}</p>
                </div>
                {item.time_step && (
                  <div>
                    <span className="text-gray-600">Time Step:</span>
                    <p className="font-medium">{item.time_step}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Custom Prompt */}
            {item.custom_prompt && (
              <>
                <Separator />
                <div>
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-semibold">Custom Prompt</Label>
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(item.custom_prompt!, "Prompt")}>
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{item.custom_prompt}</p>
                </div>
              </>
            )}

            {/* Enhancement Info */}
            {item.upscaled_image_url && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-semibold">Enhancement</Label>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    Method:{" "}
                    {item.upscale_method === "mathematical" ? "Mathematical (16x more points)" : "Pixel Enhancement"}
                  </p>
                </div>
              </>
            )}

            {/* Tags */}
            {item.tags.length > 0 && (
              <>
                <Separator />
                <div>
                  <Label className="text-sm font-semibold">Tags</Label>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {item.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Timestamps */}
            <Separator />
            <div className="text-xs text-gray-500 dark:text-gray-400">
              <div>Created: {new Date(item.created_at).toLocaleString()}</div>
              {item.updated_at !== item.created_at && <div>Updated: {new Date(item.updated_at).toLocaleString()}</div>}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
