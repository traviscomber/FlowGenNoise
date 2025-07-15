"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Heart, Palette, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"
import { GalleryService, type GalleryItem } from "@/lib/gallery-service"

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedMode, setSelectedMode] = useState<"all" | "svg" | "ai">("all")
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false)
  const [sortBy, setSortBy] = useState<"created_at" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [stats, setStats] = useState({
    totalArtworks: 0,
    svgCount: 0,
    aiCount: 0,
    enhancedCount: 0,
    favoritesCount: 0,
  })
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])

  const loadGalleryItems = async () => {
    try {
      setLoading(true)
      const result = await GalleryService.getGalleryItems({
        mode: selectedMode === "all" ? undefined : selectedMode,
        favoritesOnly: showFavoritesOnly,
        searchTerm: searchTerm || undefined,
        sortBy,
        sortOrder,
        limit: 50,
      })
      setItems(result.items)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load gallery items",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const statsData = await GalleryService.getStats()
      setStats(statsData)
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

  useEffect(() => {
    loadGalleryItems()
  }, [selectedMode, showFavoritesOnly, searchTerm, sortBy, sortOrder])

  useEffect(() => {
    loadStats()
    loadPopularTags()
  }, [])

  const handleItemUpdate = (updatedItem: GalleryItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    setSelectedItem(updatedItem)
    loadStats() // Refresh stats
  }

  const handleItemDelete = (deletedId: string) => {
    setItems(items.filter((item) => item.id !== deletedId))
    if (selectedItem?.id === deletedId) {
      setSelectedItem(null)
    }
    loadStats() // Refresh stats
  }

  const handleTagClick = (tag: string) => {
    setSearchTerm(tag)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Art Gallery</h1>
              <p className="text-gray-600">Browse and manage your generated artworks</p>
            </div>
            <Button onClick={() => (window.location.href = "/")} variant="outline">
              Create New Art
            </Button>
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
                <div className="text-2xl font-bold text-green-600">{stats.svgCount}</div>
                <div className="text-sm text-gray-600">SVG Art</div>
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
        </div>

        <div className="flex gap-6">
          {/* Main Content */}
          <div className="flex-1">
            {/* Filters and Search */}
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search */}
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search artworks..."
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
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="svg">SVG</SelectItem>
                      <SelectItem value="ai">AI</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Favorites Filter */}
                  <Button
                    variant={showFavoritesOnly ? "default" : "outline"}
                    onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                    className="flex items-center gap-2"
                  >
                    <Heart className={`w-4 h-4 ${showFavoritesOnly ? "fill-current" : ""}`} />
                    Favorites
                  </Button>

                  {/* Sort */}
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [by, order] = value.split("-") as [typeof sortBy, typeof sortOrder]
                      setSortBy(by)
                      setSortOrder(order)
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
                </div>
              </CardContent>
            </Card>

            {/* Gallery Grid */}
            {loading ? (
              <div className="text-center py-12">
                <div className="text-gray-500">Loading gallery...</div>
              </div>
            ) : (
              <GalleryGrid
                items={items}
                onItemClick={setSelectedItem}
                onItemUpdate={handleItemUpdate}
                onItemDelete={handleItemDelete}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="w-80 space-y-6">
            {/* Popular Tags */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <TrendingUp className="w-5 h-5" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                {popularTags.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {popularTags.map(({ tag, count }) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="cursor-pointer hover:bg-blue-50 text-xs"
                        onClick={() => handleTagClick(tag)}
                      >
                        {tag} ({count})
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No tags yet</div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => (window.location.href = "/")}
                >
                  <Palette className="w-4 h-4 mr-2" />
                  Create New Art
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                >
                  <Heart className="w-4 h-4 mr-2" />
                  {showFavoritesOnly ? "Show All" : "Show Favorites"}
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start bg-transparent"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedMode("all")
                    setShowFavoritesOnly(false)
                    setSortBy("created_at")
                    setSortOrder("desc")
                  }}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Gallery Viewer Modal */}
      <GalleryViewer item={selectedItem} onClose={() => setSelectedItem(null)} onItemUpdate={handleItemUpdate} />
    </div>
  )
}
