"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Heart, Grid3X3, List, ArrowLeft, Sparkles, TagIcon } from "lucide-react"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"
import { GalleryService, type GalleryItem } from "@/lib/gallery-service"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export function GalleryPage() {
  const router = useRouter()
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMode, setSelectedMode] = useState<"all" | "svg" | "ai">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"created_at" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [stats, setStats] = useState({
    totalArtworks: 0,
    svgCount: 0,
    aiCount: 0,
    enhancedCount: 0,
    favoritesCount: 0,
  })
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  useEffect(() => {
    loadGalleryItems()
    loadStats()
    loadPopularTags()
  }, [searchTerm, selectedMode, showFavoritesOnly, sortBy, sortOrder, selectedTag])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const searchQuery = selectedTag ? selectedTag : searchTerm
      const { items: galleryItems } = await GalleryService.getGalleryItems({
        mode: selectedMode === "all" ? undefined : selectedMode,
        favoritesOnly: showFavoritesOnly,
        searchTerm: searchQuery,
        sortBy,
        sortOrder,
        limit: 50,
      })
      setItems(galleryItems)
    } catch (error) {
      console.error("Failed to load gallery items:", error)
      toast.error("Failed to load gallery items")
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const galleryStats = await GalleryService.getStats()
      setStats(galleryStats)
    } catch (error) {
      console.error("Failed to load stats:", error)
    }
  }

  const loadPopularTags = async () => {
    try {
      const tags = await GalleryService.getPopularTags(10)
      setPopularTags(tags)
    } catch (error) {
      console.error("Failed to load popular tags:", error)
    }
  }

  const handleFavoriteToggle = async (id: string) => {
    try {
      await GalleryService.toggleFavorite(id)
      setItems(items.map((item) => (item.id === id ? { ...item, is_favorite: !item.is_favorite } : item)))
      if (selectedItem?.id === id) {
        setSelectedItem({ ...selectedItem, is_favorite: !selectedItem.is_favorite })
      }
      loadStats() // Refresh stats
      toast.success("Favorite status updated")
    } catch (error) {
      console.error("Failed to toggle favorite:", error)
      toast.error("Failed to update favorite status")
    }
  }

  const handleEdit = async (item: GalleryItem) => {
    // For now, just show a toast. You could implement an edit dialog here
    toast.info("Edit functionality coming soon!")
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return

    try {
      await GalleryService.deleteArtwork(id)
      setItems(items.filter((item) => item.id !== id))
      if (selectedItem?.id === id) {
        setSelectedItem(null)
      }
      loadStats() // Refresh stats
      toast.success("Artwork deleted successfully")
    } catch (error) {
      console.error("Failed to delete artwork:", error)
      toast.error("Failed to delete artwork")
    }
  }

  const handleDownload = async (item: GalleryItem) => {
    try {
      const imageUrl = item.upscaled_image_url || item.image_url
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${item.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      toast.success("Download started")
    } catch (error) {
      console.error("Failed to download image:", error)
      toast.error("Failed to download image")
    }
  }

  const handleTagClick = (tag: string) => {
    setSelectedTag(selectedTag === tag ? null : tag)
    setSearchTerm("")
  }

  const clearFilters = () => {
    setSearchTerm("")
    setSelectedMode("all")
    setShowFavoritesOnly(false)
    setSelectedTag(null)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onClick={() => router.push("/")} className="flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Back to Generator
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Art Gallery</h1>
                <p className="text-gray-600">Browse and manage your generated artworks</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalArtworks}</div>
                <div className="text-sm text-gray-600">Total Artworks</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.aiCount}</div>
                <div className="text-sm text-gray-600">AI Art</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{stats.svgCount}</div>
                <div className="text-sm text-gray-600">SVG Flow</div>
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

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search artworks..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setSelectedTag(null)
                }}
                className="pl-10"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <Select value={selectedMode} onValueChange={(value: any) => setSelectedMode(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="ai">AI Art</SelectItem>
                  <SelectItem value="svg">SVG Flow</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field as any)
                  setSortOrder(order as any)
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

              <Button
                variant={showFavoritesOnly ? "default" : "outline"}
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className="flex items-center gap-2"
              >
                <Heart className="w-4 h-4" />
                Favorites
              </Button>

              {(searchTerm || selectedMode !== "all" || showFavoritesOnly || selectedTag) && (
                <Button variant="ghost" onClick={clearFilters}>
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {/* Active Filters */}
          {(selectedTag || searchTerm || selectedMode !== "all" || showFavoritesOnly) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {selectedTag && (
                <Badge variant="secondary" className="cursor-pointer" onClick={() => setSelectedTag(null)}>
                  Tag: {selectedTag} ×
                </Badge>
              )}
              {searchTerm && <Badge variant="secondary">Search: {searchTerm}</Badge>}
              {selectedMode !== "all" && <Badge variant="secondary">Mode: {selectedMode.toUpperCase()}</Badge>}
              {showFavoritesOnly && <Badge variant="secondary">Favorites Only</Badge>}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Main Content */}
          <div className="flex-1">
            <GalleryGrid
              items={items}
              onItemClick={setSelectedItem}
              onFavoriteToggle={handleFavoriteToggle}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onDownload={handleDownload}
              loading={loading}
            />
          </div>

          {/* Sidebar */}
          <div className="w-64 space-y-6">
            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <TagIcon className="w-4 h-4" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {popularTags.map(({ tag, count }) => (
                    <div
                      key={tag}
                      className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                        selectedTag === tag ? "bg-blue-100 text-blue-700" : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleTagClick(tag)}
                    >
                      <span className="text-sm">{tag}</span>
                      <Badge variant="outline" className="text-xs">
                        {count}
                      </Badge>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => router.push("/")}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New Art
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  View Favorites
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Gallery Viewer */}
      <GalleryViewer
        item={selectedItem}
        open={!!selectedItem}
        onClose={() => setSelectedItem(null)}
        onFavoriteToggle={handleFavoriteToggle}
        onDownload={handleDownload}
      />
    </div>
  )
}
