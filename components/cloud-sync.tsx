"use client"

import { useState, useCallback, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { GalleryStorage } from "@/lib/gallery-storage"
import { uploadImageToCloud, deleteImageFromCloud, listCloudImages } from "@/lib/cloud-sync"
import { Cloud, Upload, Trash2, RefreshCcw, Loader2 } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

export function CloudSync() {
  const { toast } = useToast()
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncMessage, setSyncMessage] = useState("")
  const [cloudImages, setCloudImages] = useState<string[]>([])
  const [localImagesCount, setLocalImagesCount] = useState(0)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const fetchCloudImages = useCallback(async () => {
    setSyncMessage("Fetching cloud images...")
    const images = await listCloudImages()
    setCloudImages(images)
    setSyncMessage(`Found ${images.length} images in cloud.`)
  }, [])

  const updateLocalCount = useCallback(() => {
    setLocalImagesCount(GalleryStorage.getAllImages().length)
  }, [])

  useEffect(() => {
    if (isDialogOpen) {
      fetchCloudImages()
      updateLocalCount()
    }
  }, [isDialogOpen, fetchCloudImages, updateLocalCount])

  const handleSyncToCloud = useCallback(async () => {
    setIsSyncing(true)
    setSyncProgress(0)
    setSyncMessage("Starting cloud sync...")

    const localImages = GalleryStorage.getAllImages()
    let uploadedCount = 0

    for (let i = 0; i < localImages.length; i++) {
      const image = localImages[i]
      setSyncMessage(`Uploading image ${i + 1}/${localImages.length}: ${image.metadata.filename}`)
      const success = await uploadImageToCloud(image)
      if (success) {
        GalleryStorage.updateImageMetadata(image.id, { cloudStored: true })
        uploadedCount++
      }
      setSyncProgress(Math.round(((i + 1) / localImages.length) * 100))
    }

    setSyncMessage(`Sync complete! Uploaded ${uploadedCount} new images.`)
    toast({
      title: "Cloud Sync Complete",
      description: `Successfully synced ${uploadedCount} images to the cloud.`,
    })
    setIsSyncing(false)
    fetchCloudImages() // Refresh cloud image list
    updateLocalCount() // Refresh local image count
  }, [toast, fetchCloudImages, updateLocalCount])

  const handleClearCloud = useCallback(async () => {
    if (!confirm("Are you sure you want to delete ALL images from cloud storage? This cannot be undone.")) {
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncMessage("Deleting all cloud images...")

    let deletedCount = 0
    for (let i = 0; i < cloudImages.length; i++) {
      const imageId = cloudImages[i]
      setSyncMessage(`Deleting image ${i + 1}/${cloudImages.length}: ${imageId}`)
      const success = await deleteImageFromCloud(imageId)
      if (success) {
        deletedCount++
      }
      setSyncProgress(Math.round(((i + 1) / cloudImages.length) * 100))
    }

    setSyncMessage(`Cloud cleared! Deleted ${deletedCount} images.`)
    toast({
      title: "Cloud Cleared",
      description: `Successfully deleted ${deletedCount} images from the cloud.`,
    })
    setIsSyncing(false)
    fetchCloudImages() // Refresh cloud image list
  }, [toast, cloudImages, fetchCloudImages])

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1 bg-transparent">
          <Cloud className="h-4 w-4" />
          Cloud Sync
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Cloud Synchronization</DialogTitle>
          <DialogDescription>Manage your FlowSketch art gallery with cloud storage.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Local Images:</span>
            <span>{localImagesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Cloud Images:</span>
            <span>{cloudImages.length}</span>
            <Button variant="ghost" size="icon" onClick={fetchCloudImages} disabled={isSyncing}>
              <RefreshCcw className="h-4 w-4" />
              <span className="sr-only">Refresh Cloud List</span>
            </Button>
          </div>
          <Separator />
          <div className="space-y-2">
            <Button onClick={handleSyncToCloud} className="w-full" disabled={isSyncing}>
              {isSyncing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Syncing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" /> Upload Local to Cloud
                </>
              )}
            </Button>
            <Button onClick={handleClearCloud} className="w-full" variant="destructive" disabled={isSyncing}>
              <Trash2 className="mr-2 h-4 w-4" /> Clear All Cloud Images
            </Button>
            {/* Download from cloud functionality could be added here */}
            {/* <Button className="w-full" disabled={isSyncing}>
              <Download className="mr-2 h-4 w-4" /> Download Cloud to Local
            </Button> */}
          </div>
          {isSyncing && (
            <div className="space-y-2">
              <Progress value={syncProgress} className="w-full" />
              <p className="text-sm text-muted-foreground">{syncMessage}</p>
            </div>
          )}
          <Separator />
          <div className="space-y-2">
            <h3 className="font-medium">Cloud Storage Status:</h3>
            <ScrollArea className="h-32 rounded-md border p-2 text-sm">
              {cloudImages.length > 0 ? (
                <ul>
                  {cloudImages.map((id) => (
                    <li key={id} className="truncate">
                      {id}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-muted-foreground">No images found in cloud storage.</p>
              )}
            </ScrollArea>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
