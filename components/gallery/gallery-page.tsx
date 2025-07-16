"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Heart, ImageIcon, Sparkles, Calendar, Tag, X, BarChart3 } from "lucide-react"
import { type GalleryItem, type GalleryFilters, type GalleryStats, galleryService } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"

export function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([])
  const [stats, setStats] = useState<GalleryStats>({
    total: 0,
    svg_count: 0,
    ai_count: 0,
    favorites_count: 0,
    recent_count: 0,
  })
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [filters, setFilters] = useState<GalleryFilters>({})
  const [sortBy, setSortBy] = useState<"created_at" | "updated_at" | "title">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  // Load initial data
  useEffect(() => {
    loadData()
    loadStats()
    loadPopularTags()
  }, [])

  // Reload items when filters or sorting changes
  useEffect(() => {
    loadData()
  }, [filters, sortBy, sortOrder])

  const loadData = async () => {
    setIsLoading(true)
    const data = await galleryService.getArtworks(filters, 50, 0, sortBy, sortOrder)
    setItems(data)
    setIsLoading(false)
  }

  const loadStats = async () => {
    const statsData = await galleryService.getStats()
    setStats(statsData)
  }

  const loadPopularTags = async () => {
    const tagsData = await galleryService.getPopularTags(10)
    setPopularTags(tagsData)
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchQuery.trim() || undefined })
  }

  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  const addTagFilter = (tag: string) => {
    const currentTags = filters.tags || []
    if (!currentTags.includes(tag)) {
      setFilters({ ...filters, tags: [...currentTags, tag] })
    }
  }

  const removeTagFilter = (tag: string) => {
    const currentTags = filters.tags || []
    setFilters({ ...filters, tags: currentTags.filter((t) => t !== tag) })
  }

  const clearFilters = () => {
    setFilters({})
    setSearchQuery("")
  }

  const handleItemUpdate = (updatedItem: GalleryItem) => {
    setItems(items.map((item) => (item.id === updatedItem.id ? updatedItem : item)))
    loadStats() // Refresh stats
  }

  const handleItemDelete = (deletedId: string) => {
    setItems(items.filter((item) => item.id !== deletedId))
    loadStats() // Refresh stats
  }

  const hasActiveFilters = Object.keys(filters).some((key) => {
    const value = filters[key as keyof GalleryFilters]
    return value !== undefined && value !== "" && (Array.isArray(value) ? value.length > 0 : true)
  })

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Art Gallery</h1>
        <p className="text-muted-foreground">Browse and manage your generated artwork collection</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <div>
                <div className="text-2xl font-bold">{stats.total}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-2xl font-bold">{stats.ai_count}</div>
                <div className="text-xs text-muted-foreground">AI Art</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.svg_count}</div>
                <div className="text-xs text-muted-foreground">SVG</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <div>
                <div className="text-2xl font-bold">{stats.favorites_count}</div>
                <div className="text-xs text-muted-foreground">Favorites</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-2xl font-bold">{stats.recent_count}</div>
                <div className="text-xs text-muted-foreground">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-6">
        {/* Main Content */}
        <div className="flex-1">
          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            {/* Search Bar */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search artwork by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch}>Search</Button>
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap gap-2">
              <Select
                value={filters.mode || "all"}
                onValueChange={(value) =>
                  setFilters({ ...filters, mode: value === "all" ? undefined : (value as "svg" | "ai") })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Mode" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="svg">SVG</SelectItem>
                  <SelectItem value="ai">AI Art</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant={filters.favorites ? "default" : "outline"}
                size="sm"
                onClick={() => setFilters({ ...filters, favorites: !filters.favorites })}
              >
                <Heart className="h-4 w-4 mr-2" />
                Favorites
              </Button>

              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field as "created_at" | "updated_at" | "title")
                  setSortOrder(order as "asc" | "desc")
                }}
              >
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="created_at-desc">Newest First</SelectItem>
                  <SelectItem value="created_at-asc">Oldest First</SelectItem>
                  <SelectItem value="updated_at-desc">Recently Updated</SelectItem>
                  <SelectItem value="title-asc">Title A-Z</SelectItem>
                  <SelectItem value="title-desc">Title Z-A</SelectItem>
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>

            {/* Active Filters */}
            {hasActiveFilters && (
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.search}"
                    <button onClick={() => setFilters({ ...filters, search: undefined })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.mode && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Mode: {filters.mode.toUpperCase()}
                    <button onClick={() => setFilters({ ...filters, mode: undefined })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.favorites && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Favorites Only
                    <button onClick={() => setFilters({ ...filters, favorites: undefined })}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    Tag: {tag}
                    <button onClick={() => removeTagFilter(tag)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Gallery Grid */}
          {isLoading ? (
            <div className="text-center py-12">
              <div className="text-muted-foreground">Loading artwork...</div>
            </div>
          ) : (
            <GalleryGrid items={items} onItemUpdate={handleItemUpdate} onItemDelete={handleItemDelete} />
          )}
        </div>

        {/* Sidebar */}
        <div className="w-64 space-y-6">
          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {popularTags.map(({ tag, count }) => (
                  <div key={tag} className="flex items-center justify-between">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => addTagFilter(tag)}
                      className="h-auto p-1 justify-start"
                      disabled={filters.tags?.includes(tag)}
                    >
                      <Badge variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    </Button>
                    <span className="text-xs text-muted-foreground">{count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
