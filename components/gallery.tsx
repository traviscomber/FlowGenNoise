"use client"

import { DialogDescription } from "@/components/ui/dialog"
import { useEffect, useState, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/components/ui/use-toast"
import { Trash2, Star, StarOff, Cloud, Download, Loader2, Sparkles, Palette } from "lucide-react"
import { GalleryStorage, type GalleryImage, type GalleryStats } from "@/lib/gallery-storage"
import { CloudSync, type CloudSyncStatus } from "@/lib/cloud-sync"

interface GalleryProps {
  onImageSelect: (image: GalleryImage) => void
}

export default function Gallery({ onImageSelect }: GalleryProps) {
  const { toast } = useToast()
  const [images, setImages] = useState<GalleryImage[]>([])
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [isConfirmingClear, setIsConfirmingClear] = useState(false)
  const [galleryStats, setGalleryStats] = useState<GalleryStats>(GalleryStorage.getStorageStats([]))
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>(CloudSync.getStatus())
  const [isScoring, setIsScoring] = useState(false)
  const [scoreProgress, setScoreProgress] = useState(0)
  const [isBatchScoring, setIsBatchScoring] = useState(false)

  const loadGallery = useCallback(async () => {
    const localImages = GalleryStorage.getGallery()
    let combinedImages = [...localImages]

    if (cloudSyncStatus.isAuthenticated && cloudSyncStatus.isEnabled) {
      try {
        const cloudImages = await CloudSync.downloadImages()
        // Merge: prioritize cloud version if ID matches, otherwise add
        const cloudImageMap = new Map(
          cloudImages.map((img) => [img.id, { ...img, metadata: { ...img.metadata, cloudStored: true } }]),
        )

        combinedImages = localImages.map((localImg) => {
          if (cloudImageMap.has(localImg.id)) {
            const cloudImg = cloudImageMap.get(localImg.id)!
            cloudImageMap.delete(localImg.id) // Remove from map as it's handled
            // Simple merge: prefer cloud version if it exists, or a more complex conflict resolution
            // For now, if it's in cloud, use the cloud version and mark it.
            return { ...cloudImg, metadata: { ...cloudImg.metadata, cloudStored: true } }
          }
          return { ...localImg, metadata: { ...localImg.metadata, cloudStored: false } }
        })

        // Add any remaining cloud-only images
        for (const cloudImg of cloudImageMap.values()) {
          combinedImages.push({ ...cloudImg, metadata: { ...cloudImg.metadata, cloudStored: true } })
        }
      } catch (error) {
        console.error("Failed to load cloud images:", error)
        toast({
          title: "Cloud Sync Error",
          description: "Could not load images from cloud. Displaying local gallery.",
          variant: "destructive",
        })
      }
    } else {
      combinedImages = localImages.map((img) => ({ ...img, metadata: { ...img.metadata, cloudStored: false } }))
    }

    // Sort by creation date, newest first
    combinedImages.sort((a, b) => (b.metadata.createdAt || 0) - (a.metadata.createdAt || 0))

    setImages(combinedImages)
    setGalleryStats(GalleryStorage.getStorageStats(combinedImages))
  }, [cloudSyncStatus.isAuthenticated, cloudSyncStatus.isEnabled, toast])

  // Load gallery on mount and when cloud sync status changes
  useEffect(() => {
    loadGallery()
  }, [loadGallery])

  // Listen to cloud sync status changes
  useEffect(() => {
    const handleStatusChange = (status: CloudSyncStatus) => {
      setCloudSyncStatus(status)
    }

    CloudSync.addStatusListener(handleStatusChange)
    return () => CloudSync.removeStatusListener(handleStatusChange)
  }, [])

  // Listen for new images from the generator
  useEffect(() => {
    function addImage(e: any) {
      const newImageUrl = e.detail as string
      // Instead of directly adding to state, reload the gallery to get the full image data
      loadGallery()
    }
    window.addEventListener("new-image", addImage)
    return () => window.removeEventListener("new-image", addImage)
  }, [loadGallery])

  const handleDeleteImage = useCallback(
    async (id: string) => {
      const imageToDelete = images.find((img) => img.id === id)
      if (!imageToDelete) return

      if (imageToDelete.metadata.cloudStored) {
        try {
          await CloudSync.deleteCloudImage(id)
          toast({
            title: "Image Deleted",
            description: "Image removed from cloud and local gallery.",
            variant: "default",
          })
        } catch (error) {
          console.error("Failed to delete cloud image:", error)
          toast({
            title: "Cloud Delete Failed",
            description: "Could not delete image from cloud. Please try again.",
            variant: "destructive",
          })
          return // Prevent local deletion if cloud deletion fails
        }
      }

      GalleryStorage.deleteImage(id)
      setSelectedImage(null)
      loadGallery()
      toast({
        title: "Image Deleted",
        description: "Image removed from local gallery.",
        variant: "default",
      })
    },
    [images, loadGallery, toast],
  )

  const handleClearGallery = useCallback(async () => {
    if (cloudSyncStatus.isEnabled && cloudSyncStatus.isAuthenticated) {
      try {
        await CloudSync.clearCloudGallery()
        toast({
          title: "Cloud Gallery Cleared",
          description: "All images removed from cloud storage.",
          variant: "default",
        })
      } catch (error) {
        console.error("Failed to clear cloud gallery:", error)
        toast({
          title: "Cloud Clear Failed",
          description: "Could not clear cloud gallery. Please try again.",
          variant: "destructive",
        })
        // Continue to clear local even if cloud fails, but warn user
      }
    }

    GalleryStorage.clearGallery()
    setSelectedImage(null)
    setIsConfirmingClear(false)
    loadGallery()
    toast({
      title: "Gallery Cleared",
      description: "All images removed from local gallery.",
      variant: "default",
    })
  }, [cloudSyncStatus.isEnabled, cloudSyncStatus.isAuthenticated, loadGallery, toast])

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      const updatedImage = GalleryStorage.toggleFavorite(id)
      if (updatedImage) {
        if (updatedImage.metadata.cloudStored) {
          // If cloud stored, re-upload to update favorite status
          try {
            await CloudSync.uploadImageFullResolution(updatedImage)
            toast({
              title: "Favorite Updated",
              description: "Image favorite status synced to cloud.",
              variant: "default",
            })
          } catch (error) {
            console.error("Failed to sync favorite status:", error)
            toast({
              title: "Sync Failed",
              description: "Could not sync favorite status to cloud.",
              variant: "destructive",
            })
          }
        }
        loadGallery()
      }
    },
    [loadGallery, toast],
  )

  const handleScoreImage = useCallback(
    async (image: GalleryImage) => {
      setIsScoring(true)
      setScoreProgress(0)
      try {
        const response = await fetch("/api/score-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: image.imageUrl }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to score image")
        }

        const { aestheticScore } = await response.json()
        const updatedImage = GalleryStorage.updateImageMetadata(image.id, { aestheticScore })

        if (updatedImage && updatedImage.metadata.cloudStored) {
          await CloudSync.uploadImageFullResolution(updatedImage)
        }

        toast({
          title: "Image Scored!",
          description: `Aesthetic score: ${aestheticScore.toFixed(2)}`,
          variant: "default",
        })
        loadGallery()
      } catch (error: any) {
        console.error("Error scoring image:", error)
        toast({
          title: "Scoring Failed",
          description: error.message || "Could not score image.",
          variant: "destructive",
        })
      } finally {
        setIsScoring(false)
        setScoreProgress(0)
      }
    },
    [loadGallery, toast],
  )

  const handleBatchScore = useCallback(async () => {
    setIsBatchScoring(true)
    setScoreProgress(0)
    const imagesToScore = images.filter((img) => img.metadata.aestheticScore === undefined)
    let scoredCount = 0

    if (imagesToScore.length === 0) {
      toast({ title: "No Images to Score", description: "All images already have an aesthetic score." })
      setIsBatchScoring(false)
      return
    }

    toast({
      title: "Batch Scoring Started",
      description: `Scoring ${imagesToScore.length} images. This may take a while.`,
      duration: 5000,
    })

    for (const image of imagesToScore) {
      try {
        const response = await fetch("/api/score-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: image.imageUrl }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to score image ${image.metadata.filename}`)
        }

        const { aestheticScore } = await response.json()
        const updatedImage = GalleryStorage.updateImageMetadata(image.id, { aestheticScore })

        if (updatedImage && updatedImage.metadata.cloudStored) {
          await CloudSync.uploadImageFullResolution(updatedImage)
        }

        scoredCount++
        setScoreProgress(Math.floor((scoredCount / imagesToScore.length) * 100))
      } catch (error: any) {
        console.error(`Error scoring image ${image.metadata.filename}:`, error)
        toast({
          title: "Batch Scoring Error",
          description: `Failed to score ${image.metadata.filename}: ${error.message}`,
          variant: "destructive",
        })
      }
    }

    toast({
      title: "Batch Scoring Complete",
      description: `Scored ${scoredCount} out of ${imagesToScore.length} images.`,
      variant: "default",
    })
    setIsBatchScoring(false)
    setScoreProgress(0)
    loadGallery()
  }, [images, loadGallery, toast])

  if (images.length === 0) return null

  return (
    <section className="w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Images</h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBatchScore}
            disabled={isBatchScoring || images.filter((img) => img.metadata.aestheticScore === undefined).length === 0}
          >
            {isBatchScoring ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Scoring... {scoreProgress}%
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Batch Score
              </>
            )}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsConfirmingClear(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>

      <ScrollArea className="h-[400px] w-full rounded-md border">
        <div className="grid grid-cols-2 gap-4 p-4 md:grid-cols-3">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group cursor-pointer rounded-lg overflow-hidden border hover:border-primary transition-colors"
              onClick={() => setSelectedImage(image)}
            >
              <img
                src={image.imageUrl || "/placeholder.svg?height=128&width=128"}
                alt={image.metadata.filename || "Generated Art"}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    onImageSelect(image)
                  }}
                >
                  Select
                </Button>
              </div>
              <div className="absolute top-2 right-2 flex gap-1">
                {image.isFavorite ? (
                  <Star className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ) : (
                  <StarOff className="h-5 w-5 text-gray-300" />
                )}
                {image.metadata.cloudStored && <Cloud className="h-5 w-5 text-blue-400" title="Cloud Synced" />}
              </div>
              {image.metadata.aestheticScore !== undefined && (
                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full">
                  Score: {image.metadata.aestheticScore.toFixed(2)}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      {/* Clear confirmation dialog */}
      <Dialog open={isConfirmingClear} onOpenChange={setIsConfirmingClear}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Clear Gallery</DialogTitle>
            <DialogDescription>
              Are you sure you want to clear all images? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmingClear(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleClearGallery}>
              Clear All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image detail dialog */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="sm:max-w-[800px]">
            <DialogHeader>
              <DialogTitle>{selectedImage.metadata.filename || "Generated Art"}</DialogTitle>
              <DialogDescription>
                Generated on: {new Date(selectedImage.metadata.createdAt).toLocaleString()}
              </DialogDescription>
            </DialogHeader>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="relative">
                <img
                  src={selectedImage.imageUrl || "/placeholder.svg?height=400&width=400"}
                  alt={selectedImage.metadata.filename || "Generated Art"}
                  className="w-full h-auto object-contain rounded-md"
                />
                <div className="absolute top-2 right-2 flex gap-1">
                  {selectedImage.isFavorite ? (
                    <Star className="h-6 w-6 text-yellow-400 fill-yellow-400" />
                  ) : (
                    <StarOff className="h-6 w-6 text-gray-300" />
                  )}
                  {selectedImage.metadata.cloudStored && (
                    <Cloud className="h-6 w-6 text-blue-400" title="Cloud Synced" />
                  )}
                </div>
              </div>
              <div className="space-y-4 text-sm">
                <h3 className="font-semibold">Details:</h3>
                <p>
                  <strong>Dataset:</strong> {selectedImage.metadata.dataset}
                </p>
                <p>
                  <strong>Scenario:</strong> {selectedImage.metadata.scenario}
                </p>
                <p>
                  <strong>Color Scheme:</strong> {selectedImage.metadata.colorScheme}
                </p>
                <p>
                  <strong>Seed:</strong> {selectedImage.metadata.seed}
                </p>
                <p>
                  <strong>Samples:</strong> {selectedImage.metadata.samples}
                </p>
                <p>
                  <strong>Noise:</strong> {selectedImage.metadata.noise}
                </p>
                <p>
                  <strong>Generation Mode:</strong> {selectedImage.metadata.generationMode?.toUpperCase()}
                </p>
                {selectedImage.metadata.aestheticScore !== undefined && (
                  <p>
                    <strong>Aesthetic Score:</strong> {selectedImage.metadata.aestheticScore.toFixed(2)}
                  </p>
                )}
                <p>
                  <strong>File Size:</strong> {GalleryStorage.formatFileSize(selectedImage.metadata.fileSize || 0)}
                </p>
                <h3 className="font-semibold mt-4">Tags:</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedImage.tags.map((tag, index) => (
                    <span key={index} className="bg-muted px-2 py-1 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter className="flex flex-col sm:flex-row sm:justify-end sm:space-x-2 pt-4">
              <Button variant="outline" onClick={() => onImageSelect(selectedImage)}>
                <Palette className="h-4 w-4 mr-2" /> Use Settings
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  handleDownloadImage(
                    selectedImage.imageUrl,
                    selectedImage.metadata.generationMode === "svg" ? "svg" : "png",
                  )
                }
              >
                <Download className="h-4 w-4 mr-2" /> Download
              </Button>
              {selectedImage.metadata.aestheticScore === undefined && (
                <Button onClick={() => handleScoreImage(selectedImage)} disabled={isScoring}>
                  {isScoring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Scoring...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      Score Image
                    </>
                  )}
                </Button>
              )}
              <Button variant="outline" onClick={() => handleToggleFavorite(selectedImage.id)}>
                {selectedImage.isFavorite ? (
                  <>
                    <StarOff className="h-4 w-4 mr-2" /> Unfavorite
                  </>
                ) : (
                  <>
                    <Star className="h-4 w-4 mr-2" /> Favorite
                  </>
                )}
              </Button>
              <Button variant="destructive" onClick={() => handleDeleteImage(selectedImage.id)}>
                <Trash2 className="h-4 w-4 mr-2" /> Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </section>
  )
}

// Helper function for downloading images
function handleDownloadImage(imageUrl: string, type: "svg" | "png") {
  const link = document.createElement("a")
  link.href = imageUrl
  link.download = `flowsketch-art-${Date.now()}.${type}`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
