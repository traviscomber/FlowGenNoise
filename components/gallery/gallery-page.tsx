"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Heart, ImageIcon, Sparkles, Zap, X, TrendingUp } from "lucide-react"
import { galleryService, type ArtworkData, type GalleryFilters, type GalleryStats } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"

export function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkData[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null)
  const [isViewerOpen, setIsViewerOpen] = useState(false)

  // Filter states
  const [filters, setFilters] = useState<GalleryFilters>({
    search: "",
    mode: "all",
    dataset: "",
    scenario: "",
    isFavorite: undefined,
    tags: [],
    sortBy: "created_at",
    sortOrder: "desc",
  })

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [artworksData, statsData, tagsData] = await Promise.all([
        galleryService.getArtworks(filters),
        galleryService.getGalleryStats(),
        galleryService.getPopularTags(10),
      ])

      setArtworks(artworksData)
      setStats(statsData)
      setPopularTags(tagsData)
    } catch (error) {
      console.error("Error loading gallery data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const handleFilterChange = (key: keyof GalleryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      mode: "all",
      dataset: "",
      scenario: "",
      isFavorite: undefined,
      tags: [],
      sortBy: "created_at",
      sortOrder: "desc",
    })
  }

  const addTagFilter = (tag: string) => {
    if (!filters.tags?.includes(tag)) {
      handleFilterChange("tags", [...(filters.tags || []), tag])
    }
  }

  const removeTagFilter = (tag: string) => {
    handleFilterChange("tags", filters.tags?.filter((t) => t !== tag) || [])
  }

  const handleArtworkView = (artwork: ArtworkData) => {
    setSelectedArtwork(artwork)
    setIsViewerOpen(true)
  }

  const handleViewerClose = () => {
    setIsViewerOpen(false)
    setSelectedArtwork(null)
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.search) count++
    if (filters.mode && filters.mode !== "all") count++
    if (filters.dataset) count++
    if (filters.scenario) count++
    if (filters.isFavorite !== undefined) count++
    if (filters.tags && filters.tags.length > 0) count += filters.tags.length
    return count
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Art Gallery
          </h1>
          <p className="text-muted-foreground">Your collection of generated artwork</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/">
            <Sparkles className="mr-2 h-4 w-4" />
            Create New Art
          </a>
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalArtworks}</p>
                  <p className="text-xs text-muted-foreground">Total Artworks</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.aiArtworks}</p>
                  <p className="text-xs text-muted-foreground">AI Generated</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-cyan-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.flowArtworks}</p>
                  <p className="text-xs text-muted-foreground">Flow Fields</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-2xl font-bold">{stats.favoriteArtworks}</p>
                  <p className="text-xs text-muted-foreground">Favorites</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filters
                {getActiveFiltersCount() > 0 && (
                  <Badge variant="secondary" className="ml-auto">
                    {getActiveFiltersCount()}
                  </Badge>
                )}
              </CardTitle>
              {getActiveFiltersCount() > 0 && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Clear All Filters
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Search */}
              <div>
                <label className="text-sm font-medium mb-2 block">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search artworks..."
                    value={filters.search || ""}
                    onChange={(e) => handleFilterChange("search", e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Mode Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Mode</label>
                <Select value={filters.mode || "all"} onValueChange={(value) => handleFilterChange("mode", value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Modes</SelectItem>
                    <SelectItem value="ai">🤖 AI Generated</SelectItem>
                    <SelectItem value="flow">📊 Flow Fields</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Dataset Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Dataset</label>
                <Select
                  value={filters.dataset || "none"}
                  onValueChange={(value) => handleFilterChange("dataset", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Datasets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">All Datasets</SelectItem>
                    <SelectItem value="ffhq">👤 Human Faces</SelectItem>
                    <SelectItem value="bedroom">🛏️ Bedrooms</SelectItem>
                    <SelectItem value="church_outdoor">⛪ Churches</SelectItem>
                    <SelectItem value="celebahq">⭐ Celebrities</SelectItem>
                    <SelectItem value="neural_networks">🧠 Neural Networks</SelectItem>
                    <SelectItem value="quantum_fields">⚛️ Quantum Fields</SelectItem>
                    <SelectItem value="dna_sequences">🧬 DNA Sequences</SelectItem>
                    <SelectItem value="cosmic_phenomena">🌌 Cosmic</SelectItem>
                    <SelectItem value="fractal_geometry">🔢 Fractals</SelectItem>
                    <SelectItem value="protein_folding">🔬 Proteins</SelectItem>
                    <SelectItem value="brain_connectivity">🧠 Brain Networks</SelectItem>
                    <SelectItem value="crystalline_structures">💎 Crystals</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Favorites Filter */}
              <div>
                <label className="text-sm font-medium mb-2 block">Favorites</label>
                <Select
                  value={filters.isFavorite === undefined ? "all" : filters.isFavorite.toString()}
                  onValueChange={(value) =>
                    handleFilterChange("isFavorite", value === "all" ? undefined : value === "true")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Artworks</SelectItem>
                    <SelectItem value="true">❤️ Favorites Only</SelectItem>
                    <SelectItem value="false">Regular Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Sort */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex gap-2">
                  <Select
                    value={filters.sortBy || "created_at"}
                    onValueChange={(value) => handleFilterChange("sortBy", value)}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="created_at">Date Created</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="dataset">Dataset</SelectItem>
                      <SelectItem value="scenario">Scenario</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={filters.sortOrder || "desc"}
                    onValueChange={(value) => handleFilterChange("sortOrder", value)}
                  >
                    <SelectTrigger className="w-20">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desc">↓</SelectItem>
                      <SelectItem value="asc">↑</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Popular Tags */}
          {popularTags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Popular Tags
                </CardTitle>
                <CardDescription>Click to filter by tag</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {popularTags.map(({ tag, count }) => (
                    <Button
                      key={tag}
                      variant={filters.tags?.includes(tag) ? "default" : "outline"}
                      size="sm"
                      onClick={() => {
                        if (filters.tags?.includes(tag)) {
                          removeTagFilter(tag)
                        } else {
                          addTagFilter(tag)
                        }
                      }}
                      className="text-xs"
                    >
                      {tag} ({count})
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Active Tag Filters */}
          {filters.tags && filters.tags.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Active Tag Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      {tag}
                      <button
                        onClick={() => removeTagFilter(tag)}
                        className="ml-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your gallery...</p>
              </div>
            </div>
          ) : (
            <GalleryGrid artworks={artworks} onArtworkUpdate={loadData} onArtworkView={handleArtworkView} />
          )}
        </div>
      </div>

      {/* Artwork Viewer */}
      <GalleryViewer
        artwork={selectedArtwork}
        isOpen={isViewerOpen}
        onClose={handleViewerClose}
        onArtworkUpdate={loadData}
      />
    </div>
  )
}
