"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Heart, Calendar, Settings, Sparkles, Zap, Tag, Copy, Edit, X } from "lucide-react"
import { GalleryService, type GalleryItem } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"
import { formatDistanceToNow } from "date-fns"

interface GalleryViewerProps {
  item: GalleryItem | null
  open: boolean
  onClose: () => void
  onEdit?: (item: GalleryItem) => void
  onToggleFavorite?: (item: GalleryItem) => void
}

export function GalleryViewer({ item, open, onClose, onEdit, onToggleFavorite }: GalleryViewerProps) {
  const [imageLoading, setImageLoading] = useState(true)
  const { toast } = useToast()

  if (!item) return null

  const handleDownload = async () => {
    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const isEnhanced = !!item.upscaled_image_url
      const fileName = `${item.title.replace(/[^a-zA-Z0-9]/g, "-")}-${item.id.slice(0, 8)}${isEnhanced ? "-enhanced" : ""}.png`

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
        description: "Could not download the image.",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = async () => {
    try {
      await GalleryService.toggleFavorite(item.id)
      if (onToggleFavorite) {
        onToggleFavorite({ ...item, is_favorite: !item.is_favorite })
      }
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

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Copied to clipboard",
      description: `${label} copied to clipboard`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 h-full">
          {/* Image Section */}
          <div className="relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900">
            <div className="absolute top-4 right-4 z-10">
              <Button size="sm" variant="secondary" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="flex items-center justify-center h-full p-6">
              <img
                src={item.upscaled_image_url || item.image_url}
                alt={item.title}
                className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                onLoad={() => setImageLoading(false)}
              />
            </div>

            {/* Image overlay badges */}
            <div className="absolute bottom-4 left-4 flex gap-2">
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
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">Custom Prompt</Badge>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col">
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl mb-2">{item.title}</DialogTitle>
                  {item.description && <p className="text-gray-600 dark:text-gray-400 text-sm">{item.description}</p>}
                </div>
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6">
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button onClick={handleDownload} className="flex-1">
                    <Download className="h-4 w-4 mr-2" />
                    Download {item.upscaled_image_url ? "Enhanced" : "Original"}
                  </Button>
                  <Button
                    onClick={handleToggleFavorite}
                    variant="outline"
                    className={item.is_favorite ? "text-red-500 border-red-200" : ""}
                  >
                    <Heart className={`h-4 w-4 ${item.is_favorite ? "fill-current" : ""}`} />
                  </Button>
                  {onEdit && (
                    <Button onClick={() => onEdit(item)} variant="outline">
                      <Edit className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <Separator />

                {/* Metadata */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="h-4 w-4" />
                    Created {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
                  </div>

                  {/* Generation Parameters */}
                  <div>
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Generation Parameters
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Dataset:</span>
                        <p className="font-medium capitalize">{item.generation_params.dataset}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Scenario:</span>
                        <p className="font-medium capitalize">{item.generation_params.scenario}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Seed:</span>
                        <div className="flex items-center gap-1">
                          <p className="font-medium">{item.generation_params.seed}</p>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => copyToClipboard(item.generation_params.seed.toString(), "Seed")}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Samples:</span>
                        <p className="font-medium">{item.generation_params.numSamples.toLocaleString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Noise:</span>
                        <p className="font-medium">{item.generation_params.noiseScale}</p>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Time Step:</span>
                        <p className="font-medium">{item.generation_params.timeStep}</p>
                      </div>
                    </div>
                  </div>

                  {/* Custom Prompt */}
                  {item.custom_prompt && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        Custom Prompt
                      </h4>
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 p-3 rounded-lg">
                        <p className="text-sm text-gray-700 dark:text-gray-300">{item.custom_prompt}</p>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="mt-2 h-6 text-xs"
                          onClick={() => copyToClipboard(item.custom_prompt!, "Custom prompt")}
                        >
                          <Copy className="h-3 w-3 mr-1" />
                          Copy Prompt
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Enhancement Info */}
                  {item.upscaled_image_url && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Enhancement Details
                      </h4>
                      <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                        <p className="text-sm text-green-700 dark:text-green-300">
                          Enhanced using{" "}
                          <span className="font-medium">
                            {item.upscale_method === "mathematical"
                              ? "Mathematical Upscaling (16x more data points)"
                              : item.upscale_method === "client"
                                ? "Client-side Pixel Enhancement"
                                : "Advanced Enhancement"}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {item.tags.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2 flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Tags
                      </h4>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
