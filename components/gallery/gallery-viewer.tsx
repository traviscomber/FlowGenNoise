"use client"
import Image from "next/image"
import type { GalleryArtwork } from "@/lib/gallery-service"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Trash2, Download } from "lucide-react"
import { format } from "date-fns"

interface GalleryViewerProps {
  artwork: GalleryArtwork
  onClose: () => void
  onDelete: (id: string) => void
}

export function GalleryViewer({ artwork, onClose, onDelete }: GalleryViewerProps) {
  const handleDownload = () => {
    const link = document.createElement("a")
    link.href = artwork.imageUrl
    link.download = `${artwork.name.replace(/\s/g, "_") || "artwork"}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-6">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold text-gray-900">{artwork.name}</DialogTitle>
          <DialogDescription className="text-gray-600">{artwork.description}</DialogDescription>
        </DialogHeader>
        <div className="grid md:grid-cols-2 gap-6 mt-4">
          <div className="relative w-full aspect-square rounded-lg overflow-hidden border border-gray-200 shadow-md">
            <Image
              src={artwork.imageUrl || "/placeholder.svg"}
              alt={artwork.name || "Generated Artwork"}
              layout="fill"
              objectFit="contain"
            />
          </div>
          <div className="space-y-4 text-gray-700">
            <div>
              <h4 className="font-semibold">Original Prompt:</h4>
              <p className="text-sm bg-gray-50 p-2 rounded-md">{artwork.originalPrompt}</p>
            </div>
            {artwork.dataset && (
              <div>
                <h4 className="font-semibold">Dataset:</h4>
                <p className="text-sm">{artwork.dataset}</p>
              </div>
            )}
            {artwork.scenario && (
              <div>
                <h4 className="font-semibold">Scenario:</h4>
                <p className="text-sm">{artwork.scenario}</p>
              </div>
            )}
            <div>
              <h4 className="font-semibold">Generated On:</h4>
              <p className="text-sm">{format(new Date(artwork.created_at), "PPP 'at' p")}</p>
            </div>
            <div className="flex gap-3 mt-6">
              <Button onClick={handleDownload} className="flex-1 bg-blue-600 hover:bg-blue-700">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
              <Button onClick={() => onDelete(artwork.id)} variant="destructive" className="flex-1">
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
