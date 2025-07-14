"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2, Star, StarOff, Download, ImageIcon, Palette, Zap } from "lucide-react"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { useToast } from "@/hooks/use-toast"

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  useEffect(() => {
    loadGallery()
  }, [])

  const loadGallery = () => {
    try {
      const images = GalleryStorage.getAllImages()

      // Sanitize images to ensure metadata exists
      const sanitizedImages = images.map((image) => ({
        ...image,
        metadata: {
          dataset: "lissajous",
          colorScheme: "viridis",
          samples: 1000,
          noise: 0.1,
          seed: 12345,
          generationMode: "svg",
          scenario: "none",
          scenarioThreshold: 50,
          createdAt: Date.now(),
          filename: "unknown.svg",
          fileSize: 0,
          cloudStored: false,
          ...image.metadata, // Override with actual metadata if it exists
        },
      }))

      setGalleryImages(sanitizedImages)
    } catch (error) {
      console.error("Error loading gallery:", error)
      setGalleryImages([])
      toast({
        title: "Gallery Load Error",
        description: "Failed to load gallery images",
        variant: "destructive",
      })
    }
  }

  const handleDeleteImage = (imageId: string) => {
    try {
      GalleryStorage.deleteImage(imageId)
      loadGallery()
      setSelectedImage(null)
      toast({
        title: "Image Deleted",
        description: "Image has been removed from gallery",
      })
    } catch (error) {
      console.error("Error deleting image:", error)
      toast({
        title: "Delete Failed",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const handleToggleFavorite = (imageId: string) => {
    try {
      GalleryStorage.toggleFavorite(imageId)
      loadGallery()
      toast({
        title: "Favorite Updated",
        description: "Image favorite status changed",
      })
    } catch (error) {
      console.error("Error toggling favorite:", error)
      toast({
        title: "Update Failed",
        description: "Failed to update favorite status",
        variant: "destructive",
      })
    }
  }

  const handleDownloadImage = (image: GalleryImage) => {
    try {
      if (!image.imageUrl) {
        throw new Error("No image URL available")
      }

      // Check if it's an SVG string or a data URL
      if (image.imageUrl.startsWith("<svg")) {
        // It's an SVG string
        const blob = new Blob([image.imageUrl], { type: "image/svg+xml" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = image.metadata?.filename || `flowsketch-${image.id}.svg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      } else {
        // It's a data URL or regular URL
        const a = document.createElement("a")
        a.href = image.imageUrl
        a.download = image.metadata?.filename || `flowsketch-${image.id}.png`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      }

      toast({
        title: "Download Started",
        description: "Image download has begun",
      })
    } catch (error) {
      console.error("Error downloading image:", error)
      toast({
        title: "Download Failed",
        description: "Failed to download image",
        variant: "destructive",
      })
    }
  }

  const filteredImages = galleryImages.filter((image) => {
    if (activeTab === "favorites") {
      return image.isFavorite
    }
    return true
  })

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <Card className="w-full shadow-xl border-0 bg-white/80 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-2xl">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
            <ImageIcon className="h-6 w-6 text-white" />
          </div>
          Your Art Gallery
          <Badge variant="secondary" className="ml-auto">
            {galleryImages.length} {galleryImages.length === 1 ? "piece" : "pieces"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="all">All ({galleryImages.length})</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({galleryImages.filter((img) => img.isFavorite).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <ImageIcon className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No artwork yet</p>
                  <p className="text-sm">Generate some art to see it here!</p>
                </div>
              ) : (
                filteredImages.map((image) => (
                  <Dialog key={image.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{
                                __html: image.imageUrl || '<div class="text-gray-400">No preview</div>',
                              }}
                              style={{
                                transform: "scale(0.8)",
                                transformOrigin: "center",
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {image.metadata?.dataset || "Unknown"}
                              </Badge>
                              {image.isFavorite && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                            </div>
                            <p className="text-xs text-gray-500">
                              {image.metadata?.createdAt ? formatDate(image.metadata.createdAt) : "Unknown date"}
                            </p>
                            {image.metadata?.scenario && image.metadata.scenario !== "none" && (
                              <Badge variant="secondary" className="text-xs">
                                {image.metadata.scenario}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Artwork Details
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Image Display */}
                          <div className="space-y-4">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2">
                              <div
                                className="w-full h-full flex items-center justify-center"
                                dangerouslySetInnerHTML={{
                                  __html: image.imageUrl || '<div class="text-gray-400">No preview</div>',
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFavorite(image.id)}
                                className="flex-1"
                              >
                                {image.isFavorite ? (
                                  <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                                ) : (
                                  <StarOff className="h-4 w-4 mr-2" />
                                )}
                                {image.isFavorite ? "Unfavorite" : "Favorite"}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadImage(image)}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteImage(image.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Generation Settings
                              </h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Dataset:</span>
                                  <p className="font-mono">{image.metadata?.dataset || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Scenario:</span>
                                  <p className="font-mono">{image.metadata?.scenario || "none"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Color Scheme:</span>
                                  <p className="font-mono">{image.metadata?.colorScheme || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Mode:</span>
                                  <p className="font-mono">{image.metadata?.generationMode || "svg"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Samples:</span>
                                  <p className="font-mono">{image.metadata?.samples || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Noise:</span>
                                  <p className="font-mono">{image.metadata?.noise?.toFixed(2) || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Seed:</span>
                                  <p className="font-mono">{image.metadata?.seed || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Created:</span>
                                  <p className="text-xs">
                                    {image.metadata?.createdAt ? formatDate(image.metadata.createdAt) : "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {image.metadata?.aiDescription && (
                              <div>
                                <h3 className="font-semibold text-lg mb-3">AI Description</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  {image.metadata.aiDescription}
                                </p>
                              </div>
                            )}

                            {image.metadata?.aiPrompt && (
                              <div>
                                <h3 className="font-semibold text-lg mb-3">AI Prompt</h3>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                  {image.metadata.aiPrompt}
                                </p>
                              </div>
                            )}

                            <div>
                              <h3 className="font-semibold text-lg mb-3">File Info</h3>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="font-medium text-gray-600">Filename:</span>{" "}
                                  {image.metadata?.filename || "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Size:</span>{" "}
                                  {image.metadata?.fileSize
                                    ? `${(image.metadata.fileSize / 1024).toFixed(1)} KB`
                                    : "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Cloud Stored:</span>{" "}
                                  {image.metadata?.cloudStored ? "Yes" : "No"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="favorites" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredImages.length === 0 ? (
                <div className="col-span-full flex flex-col items-center justify-center py-12 text-gray-500">
                  <Star className="h-16 w-16 mb-4 opacity-50" />
                  <p className="text-lg font-medium">No favorites yet</p>
                  <p className="text-sm">Star some artwork to see it here!</p>
                </div>
              ) : (
                filteredImages.map((image) => (
                  <Dialog key={image.id}>
                    <DialogTrigger asChild>
                      <Card className="cursor-pointer hover:shadow-lg transition-all duration-200 group">
                        <CardContent className="p-4">
                          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
                            <div
                              className="w-full h-full flex items-center justify-center"
                              dangerouslySetInnerHTML={{
                                __html: image.imageUrl || '<div class="text-gray-400">No preview</div>',
                              }}
                              style={{
                                transform: "scale(0.8)",
                                transformOrigin: "center",
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Badge variant="outline" className="text-xs">
                                {image.metadata?.dataset || "Unknown"}
                              </Badge>
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                            </div>
                            <p className="text-xs text-gray-500">
                              {image.metadata?.createdAt ? formatDate(image.metadata.createdAt) : "Unknown date"}
                            </p>
                            {image.metadata?.scenario && image.metadata.scenario !== "none" && (
                              <Badge variant="secondary" className="text-xs">
                                {image.metadata.scenario}
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl max-h-[90vh]">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Palette className="h-5 w-5" />
                          Artwork Details
                        </DialogTitle>
                      </DialogHeader>
                      <ScrollArea className="max-h-[70vh]">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Image Display */}
                          <div className="space-y-4">
                            <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden border-2">
                              <div
                                className="w-full h-full flex items-center justify-center"
                                dangerouslySetInnerHTML={{
                                  __html: image.imageUrl || '<div class="text-gray-400">No preview</div>',
                                }}
                              />
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleToggleFavorite(image.id)}
                                className="flex-1"
                              >
                                <Star className="h-4 w-4 mr-2 text-yellow-500 fill-current" />
                                Unfavorite
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDownloadImage(image)}
                                className="flex-1"
                              >
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </Button>
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteImage(image.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          {/* Metadata */}
                          <div className="space-y-6">
                            <div>
                              <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                                <Zap className="h-5 w-5" />
                                Generation Settings
                              </h3>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <span className="font-medium text-gray-600">Dataset:</span>
                                  <p className="font-mono">{image.metadata?.dataset || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Scenario:</span>
                                  <p className="font-mono">{image.metadata?.scenario || "none"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Color Scheme:</span>
                                  <p className="font-mono">{image.metadata?.colorScheme || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Mode:</span>
                                  <p className="font-mono">{image.metadata?.generationMode || "svg"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Samples:</span>
                                  <p className="font-mono">{image.metadata?.samples || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Noise:</span>
                                  <p className="font-mono">{image.metadata?.noise?.toFixed(2) || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Seed:</span>
                                  <p className="font-mono">{image.metadata?.seed || "Unknown"}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-gray-600">Created:</span>
                                  <p className="text-xs">
                                    {image.metadata?.createdAt ? formatDate(image.metadata.createdAt) : "Unknown"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {image.metadata?.aiDescription && (
                              <div>
                                <h3 className="font-semibold text-lg mb-3">AI Description</h3>
                                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                                  {image.metadata.aiDescription}
                                </p>
                              </div>
                            )}

                            {image.metadata?.aiPrompt && (
                              <div>
                                <h3 className="font-semibold text-lg mb-3">AI Prompt</h3>
                                <p className="text-sm text-gray-700 bg-blue-50 p-3 rounded-lg">
                                  {image.metadata.aiPrompt}
                                </p>
                              </div>
                            )}

                            <div>
                              <h3 className="font-semibold text-lg mb-3">File Info</h3>
                              <div className="text-sm space-y-1">
                                <p>
                                  <span className="font-medium text-gray-600">Filename:</span>{" "}
                                  {image.metadata?.filename || "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Size:</span>{" "}
                                  {image.metadata?.fileSize
                                    ? `${(image.metadata.fileSize / 1024).toFixed(1)} KB`
                                    : "Unknown"}
                                </p>
                                <p>
                                  <span className="font-medium text-gray-600">Cloud Stored:</span>{" "}
                                  {image.metadata?.cloudStored ? "Yes" : "No"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </ScrollArea>
                    </DialogContent>
                  </Dialog>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
