"use client"

import { useState, useEffect, useCallback } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { useToast } from "@/components/ui/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Star, StarOff, Download, Trash2, Share2, CloudUpload, CloudDownload, X } from "lucide-react"
import { format } from "date-fns"
import { uploadImageToCloud, getCloudImageUrl, deleteImageFromCloud } from "@/lib/cloud-sync"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function Gallery() {
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [activeTab, setActiveTab] = useState("all")
  const { toast } = useToast()

  const loadImages = useCallback(() => {
    const images = GalleryStorage.getAllImages()
    setGalleryImages(images)
  }, [])

  useEffect(() => {
    loadImages()
    const handleStorageChange = () => loadImages()
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [loadImages])

  const handleToggleFavorite = useCallback(
    (id: string) => {
      GalleryStorage.toggleFavorite(id)
      loadImages()
      toast({
        title: "Gallery Updated",
        description: "Image favorite status changed.",
      })
    },
    [loadImages, toast],
  )

  const handleDeleteImage = useCallback(
    async (id: string) => {
      if (confirm("Are you sure you want to delete this image? This cannot be undone.")) {
        const imageToDelete = GalleryStorage.getImage(id)
        if (imageToDelete?.metadata.cloudStored) {
          const { success, error } = await deleteImageFromCloud(id)
          if (!success) {
            toast({
              title: "Cloud Delete Failed",
              description: error || "Could not delete image from cloud.",
              variant: "destructive",
            })
            return // Stop if cloud delete fails
          }
        }

        GalleryStorage.deleteImage(id)
        loadImages()
        toast({
          title: "Image Deleted",
          description: "The image has been removed from your gallery.",
          variant: "destructive",
        })
        if (selectedImage?.id === id) {
          setSelectedImage(null) // Close dialog if deleted image was open
        }
      }
    },
    [loadImages, toast, selectedImage],
  )

  const handleDownloadImage = useCallback(
    async (image: GalleryImage) => {
      try {
        const response = await fetch(image.imageUrl)
        const blob = await response.blob()
        const url = URL.createObjectURL(blob)
        const link = document.createElement("a")
        link.href = url
        link.download = image.metadata.filename || `flowsketch-art-${image.id}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(url)
        toast({
          title: "Download Complete",
          description: "Your image has been downloaded.",
        })
      } catch (error) {
        console.error("Error downloading image:", error)
        toast({
          title: "Download Failed",
          description: "Could not download the image.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleShareImage = useCallback(
    async (image: GalleryImage) => {
      if (navigator.share) {
        try {
          const response = await fetch(image.imageUrl)
          const blob = await response.blob()
          const file = new File([blob], image.metadata.filename || `flowsketch-art-${image.id}.png`, {
            type: blob.type,
          })
          await navigator.share({
            files: [file],
            title: "FlowSketch Art",
            text: image.metadata.aiDescription || "Check out this FlowSketch art!",
          })
          toast({ title: "Image Shared", description: "Your image has been shared." })
        } catch (error) {
          console.error("Error sharing image:", error)
          toast({ title: "Share Failed", description: "Could not share the image.", variant: "destructive" })
        }
      } else {
        toast({
          title: "Sharing Not Supported",
          description: "Your browser does not support the Web Share API.",
          variant: "destructive",
        })
      }
    },
    [toast],
  )

  const handleUploadToCloud = useCallback(
    async (image: GalleryImage) => {
      toast({
        title: "Uploading to Cloud...",
        description: "Your image is being uploaded to Supabase storage.",
      })
      const success = await uploadImageToCloud(image)
      if (success) {
        GalleryStorage.updateImageMetadata(image.id, { cloudStored: true })
        loadImages() // Refresh gallery to show cloud status
        toast({
          title: "Upload Complete",
          description: "Image successfully uploaded to cloud.",
        })
      } else {
        toast({
          title: "Upload Failed",
          description: "Could not upload image to cloud. Check console for details.",
          variant: "destructive",
        })
      }
    },
    [loadImages, toast],
  )

  const handleViewCloudImage = useCallback(
    async (image: GalleryImage) => {
      if (image.metadata.cloudStored) {
        const cloudUrl = await getCloudImageUrl(image.id)
        if (cloudUrl) {
          window.open(cloudUrl, "_blank")
        } else {
          toast({
            title: "Cloud Image Not Found",
            description: "Could not retrieve public URL for this image.",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Not in Cloud",
          description: "This image is not yet stored in the cloud.",
          variant: "info",
        })
      }
    },
    [toast],
  )

  const filteredImages = galleryImages.filter((image) => {
    if (activeTab === "all") return true
    if (activeTab === "favorites") return image.isFavorite
    return false
  })

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Your Art Gallery</CardTitle>
        <CardDescription>Browse and manage your generated masterpieces.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="all">All ({galleryImages.length})</TabsTrigger>
            <TabsTrigger value="favorites">
              Favorites ({galleryImages.filter((img) => img.isFavorite).length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.length > 0 ? (
                  filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image.imageUrl || "/placeholder.png"}
                        alt={image.metadata.aiDescription || `FlowSketch Art ${image.id}`}
                        width={200}
                        height={150}
                        className="w-full h-36 object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                      {image.isFavorite && (
                        <Star fill="currentColor" className="absolute top-2 right-2 h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No art in this category yet.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
          <TabsContent value="favorites" className="mt-4">
            <ScrollArea className="h-[500px] w-full rounded-md border p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredImages.length > 0 ? (
                  filteredImages.map((image) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => setSelectedImage(image)}
                    >
                      <Image
                        src={image.imageUrl || "/placeholder.png"}
                        alt={image.metadata.aiDescription || `FlowSketch Art ${image.id}`}
                        width={200}
                        height={150}
                        className="w-full h-36 object-cover rounded-md transition-transform duration-200 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-md flex items-center justify-center">
                        <Button variant="secondary" size="sm">
                          View
                        </Button>
                      </div>
                      {image.isFavorite && (
                        <Star fill="currentColor" className="absolute top-2 right-2 h-5 w-5 text-yellow-400" />
                      )}
                    </div>
                  ))
                ) : (
                  <p className="col-span-full text-center text-muted-foreground">No favorite art yet.</p>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>

        {selectedImage && (
          <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
            <DialogContent className="max-w-4xl p-0">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="relative h-[400px] md:h-[500px] flex items-center justify-center bg-muted">
                  <Image
                    src={selectedImage.imageUrl || "/placeholder.png"}
                    alt={selectedImage.metadata.aiDescription || `FlowSketch Art ${selectedImage.id}`}
                    layout="fill"
                    objectFit="contain"
                    className="rounded-l-lg"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-2 text-white hover:bg-white/20"
                    onClick={() => setSelectedImage(null)}
                  >
                    <X className="h-6 w-6" />
                    <span className="sr-only">Close</span>
                  </Button>
                </div>
                <div className="p-6 space-y-4">
                  <DialogHeader>
                    <DialogTitle className="text-2xl">Art Details</DialogTitle>
                    <DialogDescription>Metadata and options for your generated artwork.</DialogDescription>
                  </DialogHeader>
                  <ScrollArea className="h-64 pr-4">
                    <div className="grid gap-2 text-sm">
                      <p>
                        <strong>ID:</strong> {selectedImage.id}
                      </p>
                      <p>
                        <strong>Generated At:</strong> {format(selectedImage.metadata.createdAt, "PPP p")}
                      </p>
                      <p>
                        <strong>Mode:</strong>{" "}
                        {selectedImage.metadata.generationMode === "svg" ? "Mathematical SVG" : "AI Enhanced"}
                      </p>
                      {selectedImage.metadata.generationMode === "svg" && (
                        <>
                          <p>
                            <strong>Dataset:</strong> {selectedImage.metadata.dataset}
                          </p>
                          <p>
                            <strong>Samples:</strong> {selectedImage.metadata.samples}
                          </p>
                          <p>
                            <strong>Noise:</strong> {selectedImage.metadata.noise.toFixed(2)}
                          </p>
                        </>
                      )}
                      <p>
                        <strong>Color Scheme:</strong> {selectedImage.metadata.colorScheme}
                      </p>
                      <p>
                        <strong>Seed:</strong> {selectedImage.metadata.seed}
                      </p>
                      {selectedImage.metadata.generationMode === "ai" && (
                        <>
                          <p>
                            <strong>Scenario:</strong> {selectedImage.metadata.scenario || "None"}
                          </p>
                          <p>
                            <strong>AI Prompt:</strong> {selectedImage.metadata.aiPrompt || "N/A"}
                          </p>
                          <p>
                            <strong>AI Description:</strong> {selectedImage.metadata.aiDescription || "N/A"}
                          </p>
                        </>
                      )}
                      <p>
                        <strong>File Size:</strong>{" "}
                        {selectedImage.metadata.fileSize > 0
                          ? `${(selectedImage.metadata.fileSize / 1024).toFixed(2)} KB`
                          : "Calculating..."}
                      </p>
                      <p>
                        <strong>Cloud Stored:</strong> {selectedImage.metadata.cloudStored ? "Yes" : "No"}
                      </p>
                    </div>
                  </ScrollArea>
                  <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 space-y-2 sm:space-y-0">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleToggleFavorite(selectedImage.id)}
                            className={selectedImage.isFavorite ? "text-yellow-400" : ""}
                          >
                            {selectedImage.isFavorite ? (
                              <Star fill="currentColor" className="h-4 w-4" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                            <span className="sr-only">{selectedImage.isFavorite ? "Unfavorite" : "Favorite"}</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedImage.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleDownloadImage(selectedImage)}>
                            <Download className="h-4 w-4" />
                            <span className="sr-only">Download</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Download Image</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="outline" size="icon" onClick={() => handleShareImage(selectedImage)}>
                            <Share2 className="h-4 w-4" />
                            <span className="sr-only">Share</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Share Image</TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleUploadToCloud(selectedImage)}
                            disabled={selectedImage.metadata.cloudStored}
                          >
                            <CloudUpload className="h-4 w-4" />
                            <span className="sr-only">Upload to Cloud</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedImage.metadata.cloudStored ? "Already in Cloud" : "Upload to Cloud"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleViewCloudImage(selectedImage)}
                            disabled={!selectedImage.metadata.cloudStored}
                          >
                            <CloudDownload className="h-4 w-4" />
                            <span className="sr-only">View Cloud Image</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {selectedImage.metadata.cloudStored ? "View in Cloud" : "Not in Cloud"}
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="destructive" size="icon" onClick={() => handleDeleteImage(selectedImage.id)}>
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>Delete Image</TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </DialogFooter>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  )
}
