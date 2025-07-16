"use client"

import { useState, useEffect } from "react"
import { GalleryGrid } from "@/components/gallery/gallery-grid"
import { GalleryViewer } from "@/components/gallery/gallery-viewer"
import { GalleryService, type GalleryArtwork } from "@/lib/gallery-service"
import { Button } from "@/components/ui/button"
import { Loader2, PlusCircle } from "lucide-react"
import { SaveArtworkDialog } from "@/components/gallery/save-artwork-dialog"
import { useToast } from "@/hooks/use-toast"

export default function GalleryPage() {
  const [artworks, setArtworks] = useState<GalleryArtwork[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedArtwork, setSelectedArtwork] = useState<GalleryArtwork | null>(null)
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchArtworks()
  }, [])

  const fetchArtworks = async () => {
    setLoading(true)
    setError(null)
    try {
      const fetchedArtworks = await GalleryService.getArtworks()
      setArtworks(fetchedArtworks)
    } catch (err) {
      console.error("Failed to fetch artworks:", err)
      setError("Failed to load gallery. Please try again later.")
      toast({
        title: "Error",
        description: "Failed to load gallery. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSaveArtwork = async (artwork: Omit<GalleryArtwork, "id" | "created_at">) => {
    try {
      await GalleryService.saveArtwork(artwork)
      toast({
        title: "Success",
        description: "Artwork saved to gallery!",
      })
      setIsSaveDialogOpen(false)
      fetchArtworks() // Refresh gallery
    } catch (err) {
      console.error("Failed to save artwork:", err)
      toast({
        title: "Error",
        description: "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleDeleteArtwork = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this artwork?")) {
      try {
        await GalleryService.deleteArtwork(id)
        toast({
          title: "Success",
          description: "Artwork deleted from gallery.",
        })
        setSelectedArtwork(null) // Close viewer if deleted
        fetchArtworks() // Refresh gallery
      } catch (err) {
        console.error("Failed to delete artwork:", err)
        toast({
          title: "Error",
          description: "Failed to delete artwork. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Your FlowSketch Gallery
        </h1>
        <p className="mt-3 text-xl text-gray-600">A collection of your generated masterpieces.</p>
      </header>

      <div className="mb-6 flex justify-end">
        <Button onClick={() => setIsSaveDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          <PlusCircle className="mr-2 h-5 w-5" /> Add New Artwork
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
          <span className="sr-only">Loading artworks...</span>
        </div>
      )}

      {error && (
        <div className="text-center text-red-500 py-12">
          <p>{error}</p>
          <Button onClick={fetchArtworks} className="mt-4">
            Retry
          </Button>
        </div>
      )}

      {!loading && !error && artworks.length === 0 && (
        <div className="text-center text-gray-500 py-12">
          <p className="text-lg">No artworks saved yet. Start generating some art!</p>
        </div>
      )}

      {!loading && !error && artworks.length > 0 && (
        <GalleryGrid artworks={artworks} onSelectArtwork={setSelectedArtwork} />
      )}

      {selectedArtwork && (
        <GalleryViewer
          artwork={selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onDelete={handleDeleteArtwork}
        />
      )}

      <SaveArtworkDialog
        isOpen={isSaveDialogOpen}
        onClose={() => setIsSaveDialogOpen(false)}
        onSave={handleSaveArtwork}
        initialImageUrl="" // This dialog is for adding new, not saving existing generated art
        initialPrompt=""
        initialDataset=""
        initialScenario=""
      />
    </div>
  )
}
