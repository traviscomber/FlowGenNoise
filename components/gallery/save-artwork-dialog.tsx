"use client"

import type React from "react"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Loader2, Save, X, Plus } from "lucide-react"
import type { GenerationParams } from "@/lib/flow-model"

interface SaveArtworkDialogProps {
  open: boolean
  onClose: () => void
  onSave: (data: {
    title: string
    description: string
    tags: string[]
  }) => Promise<void>
  imageUrl: string
  upscaledImageUrl?: string
  generationParams: GenerationParams
  mode: "svg" | "ai"
  customPrompt?: string
  upscaleMethod?: string
}

export function SaveArtworkDialog({
  open,
  onClose,
  onSave,
  imageUrl,
  upscaledImageUrl,
  generationParams,
  mode,
  customPrompt,
  upscaleMethod,
}: SaveArtworkDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [customTags, setCustomTags] = useState<string[]>([])
  const [newTag, setNewTag] = useState("")
  const [saving, setSaving] = useState(false)

  // Auto-generate title and tags when dialog opens
  const generateAutoTitle = () => {
    const modeText = mode === "ai" ? "AI Art" : "Flow Art"
    const datasetText = generationParams.dataset.charAt(0).toUpperCase() + generationParams.dataset.slice(1)
    const scenarioText = generationParams.scenario.charAt(0).toUpperCase() + generationParams.scenario.slice(1)
    return `${modeText} - ${datasetText} ${scenarioText}`
  }

  const autoTags = [
    generationParams.dataset,
    generationParams.scenario,
    mode,
    `${generationParams.numSamples}-points`,
    `seed-${generationParams.seed}`,
    ...(upscaledImageUrl ? ["enhanced"] : []),
    ...(customPrompt ? ["custom-prompt"] : []),
  ]

  const handleOpen = () => {
    if (!title) {
      setTitle(generateAutoTitle())
    }
  }

  const addCustomTag = () => {
    if (newTag.trim() && !customTags.includes(newTag.trim().toLowerCase())) {
      setCustomTags([...customTags, newTag.trim().toLowerCase()])
      setNewTag("")
    }
  }

  const removeCustomTag = (tagToRemove: string) => {
    setCustomTags(customTags.filter((tag) => tag !== tagToRemove))
  }

  const handleSave = async () => {
    if (!title.trim()) return

    setSaving(true)
    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        tags: customTags,
      })

      // Reset form
      setTitle("")
      setDescription("")
      setCustomTags([])
      setNewTag("")
      onClose()
    } catch (error) {
      console.error("Failed to save artwork:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      addCustomTag()
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose} onOpenAutoFocus={handleOpen}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Save Artwork to Gallery</span>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 overflow-hidden">
          {/* Preview */}
          <div className="w-48 flex-shrink-0">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
              <img src={upscaledImageUrl || imageUrl} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <div className="space-y-2">
              <Badge variant={mode === "ai" ? "default" : "secondary"} className="w-full justify-center">
                {mode === "ai" ? "AI Art" : "SVG Flow"}
              </Badge>
              {upscaledImageUrl && (
                <Badge variant="outline" className="w-full justify-center">
                  Enhanced
                </Badge>
              )}
            </div>
          </div>

          {/* Form */}
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[60vh]">
            {/* Title */}
            <div>
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter artwork title..."
                className="mt-1"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your artwork..."
                className="mt-1 resize-none"
                rows={3}
              />
            </div>

            {/* Auto Tags */}
            <div>
              <Label>Auto-generated Tags</Label>
              <div className="flex flex-wrap gap-1 mt-2 p-3 bg-gray-50 rounded-lg">
                {autoTags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                These tags are automatically generated based on your generation parameters
              </p>
            </div>

            {/* Custom Tags */}
            <div>
              <Label>Custom Tags</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add custom tag..."
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addCustomTag} disabled={!newTag.trim()}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>

              {customTags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {customTags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-red-50 hover:border-red-200"
                      onClick={() => removeCustomTag(tag)}
                    >
                      {tag} <X className="w-2 h-2 ml-1" />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <Separator />

            {/* Generation Info */}
            <div>
              <Label>Generation Parameters</Label>
              <div className="mt-2 p-3 bg-gray-50 rounded-lg text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-gray-600">Dataset:</span>
                  <span>{generationParams.dataset}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Scenario:</span>
                  <span>{generationParams.scenario}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Points:</span>
                  <span>{generationParams.numSamples}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Seed:</span>
                  <span className="font-mono">{generationParams.seed}</span>
                </div>
                {customPrompt && (
                  <div className="pt-2 border-t">
                    <span className="text-gray-600 text-xs">Custom Prompt:</span>
                    <p className="text-xs mt-1 p-2 bg-white rounded border">{customPrompt}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save to Gallery
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
