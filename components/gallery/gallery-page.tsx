"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Heart, Grid3X3, List, RefreshCw } from "lucide-react"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"
import { GalleryService, type GalleryItem } from "@/lib/gallery-service"
import { useToast } from "@/hooks/use-toast"

export function GalleryPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMode, setSelectedMode] = useState<"all" | "svg" | "ai">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"created_at" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [stats, setStats] = useState({
    totalArtworks: 0,
    svgCount: 0,
    aiCount: 0,
    enhancedCount: 0,
    favoritesCount: 0,
  })
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const { toast } = useToast()

  // Load stats and popular tags
  useEffect(() => {
    const loadStats = async () => {
      try {
        const [statsData, tagsData] = await Promise.all([GalleryService.getStats(), GalleryService.getPopularTags(10)])
        setStats(statsData)
        setPopularTags(tagsData)
      } catch (error: any) {
        console.error("Failed to load stats:", error)
      }
    }
    loadStats()
  }, [refreshTrigger])

  const handleRefresh = () => {
    setRefreshTrigger((prev) => prev + 1)
    toast({
      title: "Gallery refreshed",
      description: "Loading latest artworks...",
    })
  }

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item)
  }

  const handleItemEdit = (item: GalleryItem) => {
    // TODO: Implement edit functionality
    toast({
      title: "Edit functionality",
      description: "Edit functionality coming soon!",
    })
  }

  const handleItemDelete = async (item: GalleryItem) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      try {
        await GalleryService.deleteArtwork(item.id)
        setRefreshTrigger((prev) => prev + 1)
        toast({
          title: "Artwork deleted",
          description: `"${item.title}" has been removed from your gallery.`,
        })
      } catch (error: any) {
        toast({
          title: "Failed to delete artwork",
          description: error.message,
          variant: "destructive",
        })
      }
    }
  }

  const handleToggleFavorite = (updatedItem: GalleryItem) => {
    setSelectedItem(updatedItem)
    setRefreshTrigger((prev) => prev + 1)
  }

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
          FlowSketch Gallery
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Browse and manage your generated artworks</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.totalArtworks}</div>
            <div className="text-sm text-gray-600">Total Artworks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.svgCount}</div>
            <div className="text-sm text-gray-600">SVG Artworks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.aiCount}</div>
            <div className="text-sm text-gray-600">AI Artworks</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.enhancedCount}</div>
            <div className="text-sm text-gray-600">Enhanced</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.favoritesCount}</div>
            <div className="text-sm text-gray-600">Favorites</div>
          </CardContent>
        </Card>
      </div>

      {/* Popular Tags */}
      {popularTags.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Popular Tags</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {popularTags.map(({ tag, count }) => (
                <Button key={tag} variant="outline" size="sm" onClick={() => handleTagClick(tag)} className="h-7">
                  {tag} ({count})
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters and Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search artworks, descriptions, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Mode Filter */}
            <Select value={selectedMode} onValueChange={(value: "all" | "svg" | "ai") => setSelectedMode(value)}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="svg">📊 SVG Only</SelectItem>
                <SelectItem value="ai">🤖 AI Only</SelectItem>
              </SelectContent>
            </Select>

            {/* Favorites Filter */}
            <Button
              variant={showFavoritesOnly ? "default" : "outline"}
              size="sm"
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
            >
              <Heart className={`h-4 w-4 mr-2 ${showFavoritesOnly ? "fill-current" : ""}`} />
              Favorites
            </Button>

            {/* Sort */}
            <Select
              value={`${sortBy}-${sortOrder}`}
              onValueChange={(value) => {
                const [field, order] = value.split("-")
                setSortBy(field as "created_at" | "title")
                setSortOrder(order as "asc" | "desc")
              }}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at-desc">Newest First</SelectItem>
                <SelectItem value="created_at-asc">Oldest First</SelectItem>
                <SelectItem value="title-asc">Title A-Z</SelectItem>
                <SelectItem value="title-desc">Title Z-A</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode */}
            <div className="flex gap-1">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {/* Refresh */}
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <GalleryGrid
        searchTerm={searchTerm}
        mode={selectedMode === "all" ? undefined : selectedMode}
        favoritesOnly={showFavoritesOnly}
        onItemClick={handleItemClick}
        onItemEdit={handleItemEdit}
        onItemDelete={handleItemDelete}
        refreshTrigger={refreshTrigger}
      />

      {/* Gallery Viewer */}
      <GalleryViewer
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onEdit={handleItemEdit}
        onToggleFavorite={handleToggleFavorite}
      />
    </div>
  )
}
