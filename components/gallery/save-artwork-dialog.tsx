"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { type GalleryArtwork, GalleryService } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface SaveArtworkDialogProps {
  isOpen: boolean
  onClose: () => void
  onSave: (artwork: Omit<GalleryArtwork, "id" | "created_at">) => void
  initialImageUrl: string
  initialPrompt: string
  initialDataset: string
  initialScenario: string
}

export function SaveArtworkDialog({
  isOpen,
  onClose,
  onSave,
  initialImageUrl,
  initialPrompt,
  initialDataset,
  initialScenario,
}: SaveArtworkDialogProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    if (isOpen) {
      // Generate a default name and description if not provided
      const defaultName =
        initialDataset && initialScenario ? `${initialDataset} - ${initialScenario} Art` : "Untitled FlowSketch Art"
      setName(defaultName)

      const defaultDescription = initialPrompt
        ? `An AI-generated artwork based on the prompt: "${initialPrompt}". Dataset: ${initialDataset}, Scenario: ${initialScenario}.`
        : `An AI-generated artwork from FlowSketch.`
      setDescription(defaultDescription)
    }
  }, [isOpen, initialImageUrl, initialPrompt, initialDataset, initialScenario])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      const artworkToSave: Omit<GalleryArtwork, "id" | "created_at"> = {
        name: name || "Untitled Artwork",
        description: description || "No description provided.",
        imageUrl: initialImageUrl,
        originalPrompt: initialPrompt,
        dataset: initialDataset,
        scenario: initialScenario,
      }
      await GalleryService.saveArtwork(artworkToSave)
      toast({
        title: "Success",
        description: "Artwork saved to gallery!",
      })
      onClose()
      onSave(artworkToSave) // Trigger parent's onSave to refresh gallery
    } catch (error) {
      console.error("Failed to save artwork:", error)
      toast({
        title: "Error",
        description: "Failed to save artwork. Please try again.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">Save Your Artwork</DialogTitle>
          <DialogDescription>
            Give your masterpiece a name and description before saving it to your gallery.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="relative w-full aspect-square rounded-md overflow-hidden border border-gray-200">
            {initialImageUrl ? (
              <Image
                src={initialImageUrl || "/placeholder.svg"}
                alt="Artwork preview"
                layout="fill"
                objectFit="contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400">No image preview</div>
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., 'Quantum Entanglement Symphony'"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your artwork (e.g., 'A vibrant depiction of entangled particles...')"
              rows={4}
            />
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save to Gallery"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
