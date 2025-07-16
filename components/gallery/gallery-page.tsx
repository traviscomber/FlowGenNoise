"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Heart, Sparkles, Zap, Tag, X, Palette } from "lucide-react"
import { GalleryService, type ArtworkData, type GalleryFilters, type GalleryStats } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"
import Link from "next/link"

export function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkData[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<GalleryFilters>({ mode: "all" })
  const [searchTerm, setSearchTerm] = useState("")

  // Load data
  useEffect(() => {
    loadData()
  }, [filters])

  const loadData = async () => {
    setLoading(true)
    try {
      const [artworksData, statsData, tagsData] = await Promise.all([
        GalleryService.getArtworks(filters),
        GalleryService.getStats(),
        GalleryService.getPopularTags(),
      ])

      setArtworks(artworksData)
      setStats(statsData)
      setPopularTags(tagsData)
    } catch (error) {
      console.error("Error loading gallery data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = () => {
    setFilters({ ...filters, search: searchTerm })
  }

  const handleFilterChange = (key: keyof GalleryFilters, value: any) => {
    setFilters({ ...filters, [key]: value })
  }

  const clearFilter = (key: keyof GalleryFilters) => {
    const newFilters = { ...filters }
    delete newFilters[key]
    setFilters(newFilters)
  }

  const clearAllFilters = () => {
    setFilters({ mode: "all" })
    setSearchTerm("")
  }

  const handleArtworkUpdate = (updatedArtwork: ArtworkData) => {
    setArtworks(artworks.map((artwork) => (artwork.id === updatedArtwork.id ? updatedArtwork : artwork)))
  }

  const handleArtworkDelete = (deletedId: string) => {
    setArtworks(artworks.filter((artwork) => artwork.id !== deletedId))
    loadData() // Refresh stats
  }

  const activeFiltersCount = Object.keys(filters).length - 1 // Exclude 'mode' from count

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Art Gallery</h1>
          <p className="text-muted-foreground">Your collection of generated artwork</p>
        </div>
        <Link href="/">
          <Button variant="outline">
            <Palette className="mr-2 h-4 w-4" />
            Generate New Art
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold">{stats.totalArtworks}</div>
              <div className="text-xs text-muted-foreground">Total Artworks</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.flowArtworks}</div>
              <div className="text-xs text-muted-foreground">Flow Art</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.aiArtworks}</div>
              <div className="text-xs text-muted-foreground">AI Art</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-red-600">{stats.favoriteArtworks}</div>
              <div className="text-xs text-muted-foreground">Favorites</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.totalDatasets}</div>
              <div className="text-xs text-muted-foreground">Datasets</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.totalScenarios}</div>
              <div className="text-xs text-muted-foreground">Scenarios</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          {/* Search */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Search className="h-4 w-4" />
                Search
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Input
                  placeholder="Search artworks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                />
                <Button size="sm" onClick={handleSearch}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between text-base">
                <span className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Filters
                </span>
                {activeFiltersCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                    Clear All
                  </Button>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mode Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mode</label>
                <Select
                  value={filters.mode || "all"}
                  onValueChange={(value) => handleFilterChange("mode", value || undefined)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All modes" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All modes</SelectItem>
                    <SelectItem value="flow">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4" />
                        Flow Field
                      </div>
                    </SelectItem>
                    <SelectItem value="ai">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4" />
                        AI Art
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div>
                <Button
                  variant={filters.isFavorite ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleFilterChange("isFavorite", filters.isFavorite ? undefined : true)}
                  className="w-full justify-start"
                >
                  <Heart className={`h-4 w-4 mr-2 ${filters.isFavorite ? "fill-current" : ""}`} />
                  Favorites Only
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4" />
                  Popular Tags
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-1">
                  {popularTags.slice(0, 15).map(({ tag, count }) => (
                    <Button
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        const currentTags = filters.tags || []
                        const newTags = currentTags.includes(tag)
                          ? currentTags.filter((t) => t !== tag)
                          : [...currentTags, tag]
                        handleFilterChange("tags", newTags.length > 0 ? newTags : undefined)
                      }}
                      className="text-xs h-7"
                    >
                      {tag} ({count})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Active Filters:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Search: "{filters.search}"
                    <button onClick={() => clearFilter("search")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.mode && filters.mode !== "all" && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Mode: {filters.mode}
                    <button onClick={() => clearFilter("mode")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.isFavorite && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    Favorites Only
                    <button onClick={() => clearFilter("isFavorite")}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                )}
                {filters.tags?.map((tag) => (
                  <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                    Tag: {tag}
                    <button
                      onClick={() => {
                        const newTags = filters.tags!.filter((t) => t !== tag)
                        handleFilterChange("tags", newTags.length > 0 ? newTags : undefined)
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Results */}
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              {loading ? "Loading..." : `${artworks.length} artwork${artworks.length !== 1 ? "s" : ""} found`}
            </p>
          </div>

          {/* Gallery Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="text-muted-foreground mt-4">Loading artworks...</p>
            </div>
          ) : (
            <GalleryGrid
              artworks={artworks}
              onArtworkUpdate={handleArtworkUpdate}
              onArtworkDelete={handleArtworkDelete}
            />
          )}
        </div>
      </div>
    </div>
  )
}
