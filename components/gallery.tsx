"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Heart, Download, Trash2, Grid3X3, List, Star, Settings, Archive, Eye, Copy, Zap, Award } from "lucide-react"
import { GalleryStorage, type GalleryImage } from "@/lib/gallery-storage"
import { cn } from "@/lib/utils"

interface GalleryProps {
  onImageSelect?: (image: GalleryImage) => void
}

export function Gallery({ onImageSelect }: GalleryProps) {
  const [images, setImages] = useState<GalleryImage[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDataset, setFilterDataset] = useState("all")
  const [filterScenario, setFilterScenario] = useState("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null)
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "favorites" | "score">("newest")
  const [storageStats, setStorageStats] = useState(GalleryStorage.getStorageStats())
  const [isScoring, setIsScoring] = useState(false)
  const [scoringProgress, setScoringProgress] = useState(0)

  useEffect(() => {
    loadGallery()
  }, [])

  useEffect(() => {
    setStorageStats(GalleryStorage.getStorageStats())
  }, [images])

  const loadGallery = () => {
    setImages(GalleryStorage.getGallery())
  }

  const filteredAndSortedImages = useMemo(() => {
    const filtered = images.filter((image) => {
      const matchesSearch =
        image.metadata.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
        image.tags.some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      const matchesDataset = filterDataset === "all" || image.metadata.dataset === filterDataset
      const matchesScenario = filterScenario === "all" || image.metadata.scenario === filterScenario
      const matchesFavorites = !showFavoritesOnly || image.isFavorite

      return matchesSearch && matchesDataset && matchesScenario && matchesFavorites
    })

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.metadata.createdAt - a.metadata.createdAt
        case "oldest":
          return a.metadata.createdAt - b.metadata.createdAt
        case "favorites":
          if (a.isFavorite && !b.isFavorite) return -1
          if (!a.isFavorite && b.isFavorite) return 1
          return b.metadata.createdAt - a.metadata.createdAt
        case "score":
          const scoreA = a.aestheticScore?.score || 0
          const scoreB = b.aestheticScore?.score || 0
          if (scoreA !== scoreB) return scoreB - scoreA
          return b.metadata.createdAt - a.metadata.createdAt
        default:
          return 0
      }
    })

    return filtered
  }, [images, searchTerm, filterDataset, filterScenario, showFavoritesOnly, sortBy])

  const handleToggleFavorite = (id: string) => {
    GalleryStorage.toggleFavorite(id)
    loadGallery()
  }

  const handleDeleteImage = (id: string) => {
    GalleryStorage.deleteImage(id)
    loadGallery()
    if (selectedImage?.id === id) {
      setSelectedImage(null)
    }
  }

  const handleDownloadImage = (image: GalleryImage) => {
    const link = document.createElement("a")
    link.href = image.imageUrl
    link.download = image.metadata.filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleScoreImage = async (id: string) => {
    const result = await GalleryStorage.scoreImage(id)
    if (result.success) {
      loadGallery()
    }
  }

  const handleBatchScore = async () => {
    setIsScoring(true)
    setScoringProgress(0)

    try {
      const result = await GalleryStorage.batchScoreImages((progress) => {
        setScoringProgress(progress)
      })

      loadGallery()
      console.log(`Scored ${result.scored} images, ${result.failed} failed`)
    } catch (error) {
      console.error("Batch scoring failed:", error)
    } finally {
      setIsScoring(false)
      setScoringProgress(0)
    }
  }

  const handleClearGallery = () => {
    if (confirm("Are you sure you want to delete all images? This cannot be undone.")) {
      GalleryStorage.clearGallery()
      loadGallery()
      setSelectedImage(null)
    }
  }

  const handleExportGallery = () => {
    const data = GalleryStorage.exportGallery()
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `flowsketch-gallery-${Date.now()}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const storageInfo = GalleryStorage.getStorageInfo()
  const storagePercentage = (storageInfo.used / storageInfo.available) * 100

  const uniqueDatasets = [...new Set(images.map((img) => img.metadata.dataset))]
  const uniqueScenarios = [...new Set(images.map((img) => img.metadata.scenario))]

  const unscoredCount = images.filter((img) => !img.aestheticScore).length

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Archive className="h-5 w-5" />
              Gallery ({filteredAndSortedImages.length})
              {storageStats.averageScore > 0 && (
                <Badge variant="outline" className="ml-2">
                  <Award className="h-3 w-3 mr-1" />
                  Avg: {storageStats.averageScore}/10
                </Badge>
              )}
            </CardTitle>
            <CardDescription>
              Your generated artworks • {storageInfo.imageCount} total images • {storageStats.topRatedImages} top-rated
              (7.0+)
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}>
              {viewMode === "grid" ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
            </Button>
            {unscoredCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleBatchScore} disabled={isScoring}>
                {isScoring ? (
                  <>
                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-current mr-1" />
                    {Math.round(scoringProgress)}%
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-1" />
                    Score All ({unscoredCount})
                  </>
                )}
              </Button>
            )}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Gallery Settings</DialogTitle>
                  <DialogDescription>Manage your high-resolution gallery and aesthetic scoring</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>High-Resolution Storage & Scoring</Label>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Local Images:</span>
                        <span>{storageStats.localImages}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Average Score:</span>
                        <span className={cn("font-medium", GalleryStorage.getScoreColor(storageStats.averageScore))}>
                          {storageStats.averageScore > 0 ? `${storageStats.averageScore}/10` : "Not scored"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Top Rated (7.0+):</span>
                        <span className="text-green-600 font-medium">{storageStats.topRatedImages}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Total Size:</span>
                        <span>{GalleryStorage.formatFileSize(storageStats.totalSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Largest Image:</span>
                        <span>{GalleryStorage.formatFileSize(storageStats.largestImage)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground mb-1">
                        <span>Local Storage: {(storageInfo.used / 1024).toFixed(1)} KB used</span>
                        <span>{(storageInfo.available / 1024 / 1024).toFixed(1)} MB available</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${Math.min(storagePercentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 text-sm font-medium mb-1">
                      <Zap className="h-4 w-4" />
                      No Authentication Required
                    </div>
                    <p className="text-blue-600 text-xs">
                      All images stored locally with aesthetic scoring. Works completely offline!
                    </p>
                  </div>
                  <Separator />
                  <div className="flex gap-2">
                    <Button onClick={handleExportGallery} variant="outline" className="flex-1 bg-transparent">
                      <Download className="h-4 w-4 mr-2" />
                      Export Gallery
                    </Button>
                    <Button onClick={handleClearGallery} variant="destructive" className="flex-1">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear All
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        {/* Filters */}
        <div className="p-6 pb-4 space-y-4">
          <div className="flex gap-2">
            <div className="flex-1">
              <Input
                placeholder="Search images..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={cn("h-4 w-4", showFavoritesOnly && "fill-current")} />
            </Button>
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={filterDataset} onValueChange={setFilterDataset}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Dataset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Datasets</SelectItem>
                {uniqueDatasets.map((dataset) => (
                  <SelectItem key={dataset} value={dataset}>
                    {dataset}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterScenario} onValueChange={setFilterScenario}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Scenario" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Scenarios</SelectItem>
                {uniqueScenarios.map((scenario) => (
                  <SelectItem key={scenario} value={scenario}>
                    {scenario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="oldest">Oldest</SelectItem>
                <SelectItem value="favorites">Favorites</SelectItem>
                <SelectItem value="score">
                  <div className="flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Score
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Image Grid/List */}
        <ScrollArea className="h-[600px] px-6">
          {filteredAndSortedImages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Archive className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">No images found</p>
              <p className="text-sm">
                {images.length === 0
                  ? "Generate your first artwork to start building your gallery"
                  : "Try adjusting your search or filters"}
              </p>
            </div>
          ) : (
            <div
              className={cn(
                "pb-6",
                viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-4",
              )}
            >
              {filteredAndSortedImages.map((image) => (
                <div
                  key={image.id}
                  className={cn(
                    "group relative border rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer",
                    viewMode === "list" && "flex gap-4 p-4",
                  )}
                  onClick={() => setSelectedImage(image)}
                >
                  <div className={cn("relative", viewMode === "grid" ? "aspect-video" : "w-24 h-16 flex-shrink-0")}>
                    <img
                      src={
                        viewMode === "grid" && image.thumbnail ? image.thumbnail : image.imageUrl || "/placeholder.svg"
                      }
                      alt={image.metadata.filename}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />

                    {/* Overlay buttons */}
                    <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFavorite(image.id)
                        }}
                      >
                        <Heart className={cn("h-4 w-4", image.isFavorite && "fill-red-500 text-red-500")} />
                      </Button>
                      {!image.aestheticScore && (
                        <Button
                          size="sm"
                          variant="secondary"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleScoreImage(image.id)
                          }}
                        >
                          <Award className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    {image.isFavorite && (
                      <Star className="absolute top-2 left-2 h-4 w-4 fill-yellow-400 text-yellow-400" />
                    )}

                    {/* Aesthetic Score Badge */}
                    {image.aestheticScore && (
                      <div className="absolute bottom-2 right-2">
                        <Badge
                          variant={GalleryStorage.getScoreBadgeVariant(image.aestheticScore.score)}
                          className="text-xs"
                        >
                          <Award className="h-3 w-3 mr-1" />
                          {image.aestheticScore.score}
                        </Badge>
                      </div>
                    )}
                  </div>

                  <div className={cn("p-3", viewMode === "list" && "flex-1 p-0")}>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {image.metadata.dataset}
                      </Badge>
                      {image.metadata.scenario !== "none" && (
                        <Badge variant="outline" className="text-xs">
                          {image.metadata.scenario}
                        </Badge>
                      )}
                      {image.metadata.fileSize && (
                        <Badge variant="outline" className="text-xs text-green-600">
                          {GalleryStorage.formatFileSize(image.metadata.fileSize)}
                        </Badge>
                      )}
                      {image.aestheticScore && (
                        <Badge
                          variant={GalleryStorage.getScoreBadgeVariant(image.aestheticScore.score)}
                          className="text-xs"
                        >
                          {image.aestheticScore.score}/10
                        </Badge>
                      )}
                    </div>

                    <p className="text-sm font-medium truncate mb-1">
                      {image.metadata.filename.replace(/\.[^/.]+$/, "")}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {new Date(image.metadata.createdAt).toLocaleDateString()}
                      {image.aestheticScore && (
                        <span
                          className={cn("ml-2 font-medium", GalleryStorage.getScoreColor(image.aestheticScore.score))}
                        >
                          • {image.aestheticScore.rating}
                        </span>
                      )}
                    </p>

                    {viewMode === "list" && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDownloadImage(image)
                          }}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteImage(image.id)
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>

      {/* Image Detail Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                {selectedImage.metadata.filename.replace(/\.[^/.]+$/, "")}
                {selectedImage.aestheticScore && (
                  <Badge variant={GalleryStorage.getScoreBadgeVariant(selectedImage.aestheticScore.score)}>
                    <Award className="h-3 w-3 mr-1" />
                    {selectedImage.aestheticScore.score}/10 • {selectedImage.aestheticScore.rating}
                  </Badge>
                )}
              </DialogTitle>
              <DialogDescription>
                Generated on {new Date(selectedImage.metadata.createdAt).toLocaleString()}
                {selectedImage.metadata.fileSize && (
                  <span className="ml-2">• {GalleryStorage.formatFileSize(selectedImage.metadata.fileSize)}</span>
                )}
                {selectedImage.aestheticScore && (
                  <span className="ml-2">• Scored via {selectedImage.aestheticScore.method}</span>
                )}
              </DialogDescription>
            </DialogHeader>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <img
                  src={selectedImage.imageUrl || "/placeholder.svg"}
                  alt={selectedImage.metadata.filename}
                  className="w-full h-auto rounded-lg border"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Settings</Label>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Dataset:</span>
                      <Badge variant="secondary">{selectedImage.metadata.dataset}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Scenario:</span>
                      <Badge variant="outline">{selectedImage.metadata.scenario}</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Color Scheme:</span>
                      <span>{selectedImage.metadata.colorScheme}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Seed:</span>
                      <span>{selectedImage.metadata.seed}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Samples:</span>
                      <span>{selectedImage.metadata.samples}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Noise:</span>
                      <span>{selectedImage.metadata.noise.toFixed(3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Mode:</span>
                      <Badge variant={selectedImage.metadata.generationMode === "ai" ? "default" : "secondary"}>
                        {selectedImage.metadata.generationMode.toUpperCase()}
                      </Badge>
                    </div>
                    {selectedImage.aestheticScore && (
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Aesthetic Score:</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={GalleryStorage.getScoreBadgeVariant(selectedImage.aestheticScore.score)}>
                            {selectedImage.aestheticScore.score}/10
                          </Badge>
                          <span
                            className={cn("text-xs", GalleryStorage.getScoreColor(selectedImage.aestheticScore.score))}
                          >
                            {selectedImage.aestheticScore.rating}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="flex flex-col gap-2">
                  <Button onClick={() => handleDownloadImage(selectedImage)} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Download Full Resolution
                  </Button>

                  <Button variant="outline" onClick={() => handleToggleFavorite(selectedImage.id)} className="w-full">
                    <Heart className={cn("h-4 w-4 mr-2", selectedImage.isFavorite && "fill-current")} />
                    {selectedImage.isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </Button>

                  {!selectedImage.aestheticScore && (
                    <Button variant="outline" onClick={() => handleScoreImage(selectedImage.id)} className="w-full">
                      <Award className="h-4 w-4 mr-2" />
                      Score Aesthetic Quality
                    </Button>
                  )}

                  {onImageSelect && (
                    <Button
                      variant="outline"
                      onClick={() => {
                        onImageSelect(selectedImage)
                        setSelectedImage(null)
                      }}
                      className="w-full"
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Use These Settings
                    </Button>
                  )}

                  <Button variant="destructive" onClick={() => handleDeleteImage(selectedImage.id)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Image
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </Card>
  )
}
