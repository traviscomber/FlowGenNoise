"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, Heart, Sparkles, BarChart3, ArrowLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { galleryService, type GalleryItem, type GalleryStats } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"
import Link from "next/link"

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [stats, setStats] = useState<GalleryStats>({ total: 0, svg: 0, ai: 0, favorites: 0, enhanced: 0 })
  const [popularTags, setPopularTags] = useState<{ tag: string; count: number }[]>([])
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null)
  const [viewerOpen, setViewerOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [modeFilter, setModeFilter] = useState<"all" | "svg" | "ai">("all")
  const [favoritesOnly, setFavoritesOnly] = useState(false)
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [sortBy, setSortBy] = useState<"created_at" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const { toast } = useToast()

  const loadData = useCallback(async () => {
    setLoading(true)
    try {
      const [itemsData, statsData, tagsData] = await Promise.all([
        galleryService.getGalleryItems({
          search: searchQuery || undefined,
          mode: modeFilter === "all" ? undefined : modeFilter,
          favorites: favoritesOnly || undefined,
          tags: selectedTags.length > 0 ? selectedTags : undefined,
          sortBy,
          sortOrder,
          limit: 50,
        }),
        galleryService.getStats(),
        galleryService.getPopularTags(),
      ])

      setItems(itemsData)
      setStats(statsData)
      setPopularTags(tagsData)
    } catch (error: any) {
      console.error("Failed to load gallery data:", error)
      toast({
        title: "Failed to load gallery",
        description: error.message || "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, modeFilter, favoritesOnly, selectedTags, sortBy, sortOrder, toast])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleItemClick = (item: GalleryItem) => {
    setSelectedItem(item)
    setViewerOpen(true)
  }

  const handleItemChange = () => {
    loadData()
    // Update selected item if it's currently viewed
    if (selectedItem) {
      galleryService.getGalleryItem(selectedItem.id).then((updatedItem) => {
        if (updatedItem) {
          setSelectedItem(updatedItem)
        }
      })
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const clearFilters = () => {
    setSearchQuery("")
    setModeFilter("all")
    setFavoritesOnly(false)
    setSelectedTags([])
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gallery
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Your collection of generated artwork</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Generator
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Statistics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Artworks:</span>
                <span className="font-medium">{stats.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">SVG Generated:</span>
                <span className="font-medium">{stats.svg}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">AI Generated:</span>
                <span className="font-medium">{stats.ai}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Favorites:</span>
                <span className="font-medium">{stats.favorites}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Enhanced:</span>
                <span className="font-medium">{stats.enhanced}</span>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search artworks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mode Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Mode</label>
                <Select value={modeFilter} onValueChange={(value: "all" | "svg" | "ai") => setModeFilter(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="svg">📊 SVG Only</SelectItem>
                    <SelectItem value="ai">🤖 AI Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="favorites"
                  checked={favoritesOnly}
                  onChange={(e) => setFavoritesOnly(e.target.checked)}
                  className="rounded"
                />
                <label htmlFor="favorites" className="text-sm font-medium flex items-center gap-1">
                  <Heart className="h-4 w-4" />
                  Favorites Only
                </label>
              </div>

              {/* Sort */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Sort By</label>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={(value: "created_at" | "title") => setSortBy(value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Date</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={sortOrder} onValueChange={(value: "asc" | "desc") => setSortOrder(value)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">Newest</SelectItem>
                      <SelectItem value="asc">Oldest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button onClick={clearFilters} variant="outline" className="w-full bg-transparent">
                Clear Filters
              </Button>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {popularTags.slice(0, 15).map(({ tag, count }) => (
                    <Badge
                      key={tag}
                      variant={selectedTags.includes(tag) ? "default" : "outline"}
                      className="text-xs cursor-pointer hover:bg-primary/80"
                      onClick={() => toggleTag(tag)}
                    >
                      {tag} ({count})
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Active Filters */}
          {(searchQuery || modeFilter !== "all" || favoritesOnly || selectedTags.length > 0) && (
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-medium">Active filters:</span>
                  {searchQuery && <Badge variant="secondary">Search: "{searchQuery}"</Badge>}
                  {modeFilter !== "all" && <Badge variant="secondary">Mode: {modeFilter.toUpperCase()}</Badge>}
                  {favoritesOnly && (
                    <Badge variant="secondary">
                      <Heart className="h-3 w-3 mr-1" />
                      Favorites
                    </Badge>
                  )}
                  {selectedTags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      Tag: {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-500 dark:text-gray-400">
                <Sparkles className="h-12 w-12 mx-auto mb-4 opacity-50 animate-spin" />
                <p>Loading your gallery...</p>
              </div>
            </div>
          ) : (
            <GalleryGrid items={items} onItemClick={handleItemClick} onItemsChange={handleItemChange} />
          )}
        </div>
      </div>

      {/* Gallery Viewer */}
      <GalleryViewer
        item={selectedItem}
        open={viewerOpen}
        onOpenChange={setViewerOpen}
        onItemChange={handleItemChange}
      />
    </div>
  )
}
