"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Download, Heart, X, Copy, Check, Sparkles, Palette, Settings, Calendar, Tag } from "lucide-react"
import type { GalleryItem } from "@/lib/gallery-service"
import { cn } from "@/lib/utils"

interface GalleryViewerProps {
  item: GalleryItem | null
  open: boolean
  onClose: () => void
  onFavoriteToggle: (id: string) => void
  onDownload: (item: GalleryItem) => void
}

export function GalleryViewer({ item, open, onClose, onFavoriteToggle, onDownload }: GalleryViewerProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null)

  if (!item) return null

  const copyToClipboard = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 2000)
    } catch (err) {
      console.error("Failed to copy:", err)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <div className="flex flex-col lg:flex-row h-full">
          {/* Image Section */}
          <div className="flex-1 relative bg-gray-50 flex items-center justify-center p-4">
            <img
              src={item.upscaled_image_url || item.image_url}
              alt={item.title}
              className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            />

            {/* Image overlay actions */}
            <div className="absolute top-4 right-4 flex gap-2">
              <Button size="sm" variant="secondary" onClick={() => onDownload(item)}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
              <Button size="sm" variant="secondary" onClick={() => onFavoriteToggle(item.id)}>
                <Heart className={cn("w-4 h-4 mr-2", item.is_favorite && "fill-red-500 text-red-500")} />
                {item.is_favorite ? "Unfavorite" : "Favorite"}
              </Button>
            </div>

            {/* Enhancement badge */}
            {item.upscaled_image_url && (
              <div className="absolute top-4 left-4">
                <Badge className="bg-green-500 text-white">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="w-full lg:w-96 border-l">
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <DialogTitle className="text-xl mb-2">{item.title}</DialogTitle>
                  {item.description && <p className="text-gray-600 text-sm">{item.description}</p>}
                </div>
                <Button variant="ghost" size="sm" onClick={onClose}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="flex items-center gap-2 mt-4">
                <Badge variant={item.mode === "ai" ? "default" : "secondary"}>
                  {item.mode === "ai" ? (
                    <>
                      <Sparkles className="w-3 h-3 mr-1" />
                      AI Art
                    </>
                  ) : (
                    <>
                      <Palette className="w-3 h-3 mr-1" />
                      SVG Flow
                    </>
                  )}
                </Badge>
                {item.is_favorite && (
                  <Badge variant="outline" className="text-red-500 border-red-200">
                    <Heart className="w-3 h-3 mr-1 fill-current" />
                    Favorite
                  </Badge>
                )}
              </div>
            </DialogHeader>

            <ScrollArea className="flex-1 px-6">
              <div className="space-y-6 pb-6">
                {/* Tags */}
                {item.tags.length > 0 && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Tag className="w-4 h-4 mr-2" />
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

                {/* Generation Parameters */}
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Generation Parameters
                  </h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Dataset:</span>
                      <Badge variant="outline">{item.generation_params.dataset}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Scenario:</span>
                      <Badge variant="outline">{item.generation_params.scenario}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Points:</span>
                      <span className="font-mono">{item.generation_params.numSamples}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Seed:</span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">{item.generation_params.seed}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => copyToClipboard(item.generation_params.seed.toString(), "seed")}
                        >
                          {copiedField === "seed" ? (
                            <Check className="w-3 h-3 text-green-500" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    {item.generation_params.temperature && (
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Temperature:</span>
                        <span className="font-mono">{item.generation_params.temperature}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Custom Prompt (for AI art) */}
                {item.custom_prompt && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center justify-between">
                      <span className="flex items-center">
                        <Sparkles className="w-4 h-4 mr-2" />
                        Custom Prompt
                      </span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
                        onClick={() => copyToClipboard(item.custom_prompt!, "prompt")}
                      >
                        {copiedField === "prompt" ? (
                          <Check className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-3 text-sm">{item.custom_prompt}</div>
                  </div>
                )}

                {/* Enhancement Info */}
                {item.upscaled_image_url && (
                  <div>
                    <h4 className="font-medium text-sm mb-2 flex items-center">
                      <Sparkles className="w-4 h-4 mr-2" />
                      Enhancement
                    </h4>
                    <div className="text-sm space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">Method:</span>
                        <Badge variant="outline">{item.upscale_method || "Unknown"}</Badge>
                      </div>
                      <div className="text-xs text-gray-500">This artwork has been enhanced for higher quality</div>
                    </div>
                  </div>
                )}

                <Separator />

                {/* Metadata */}
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    Metadata
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span className="text-xs">{formatDate(item.created_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Updated:</span>
                      <span className="text-xs">{formatDate(item.updated_at)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono">{item.id.slice(0, 8)}...</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-4 w-4 p-0"
                          onClick={() => copyToClipboard(item.id, "id")}
                        >
                          {copiedField === "id" ? (
                            <Check className="w-2 h-2 text-green-500" />
                          ) : (
                            <Copy className="w-2 h-2" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
