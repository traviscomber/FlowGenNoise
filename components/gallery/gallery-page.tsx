"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, Heart, Palette, BarChart3, Tag, X, SortAsc, SortDesc } from "lucide-react"
import { galleryService, type ArtworkData, type GalleryFilters, type GalleryStats } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"
import { GalleryViewer } from "./gallery-viewer"

export function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkData[]>([])
  const [stats, setStats] = useState<GalleryStats | null>(null)
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [selectedArtwork, setSelectedArtwork] = useState<ArtworkData | null>(null)
  const [loading, setLoading] = useState(true)
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
    setLoading(true)
    const [artworksData, statsData, tagsData] = await Promise.all([
      galleryService.getArtworks(filters),
      galleryService.getStats(),
      galleryService.getPopularTags(15),
    ])

    setArtworks(artworksData)
    setStats(statsData)
    setPopularTags(tagsData)
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [filters])

  const updateFilter = (key: keyof GalleryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const addTagFilter = (tag: string) => {
    if (!filters.tags?.includes(tag)) {
      updateFilter("tags", [...(filters.tags || []), tag])
    }
  }

  const removeTagFilter = (tag: string) => {
    updateFilter("tags", filters.tags?.filter((t) => t !== tag) || [])
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

  const hasActiveFilters =
    filters.search ||
    filters.mode !== "all" ||
    filters.dataset ||
    filters.scenario ||
    filters.isFavorite !== undefined ||
    (filters.tags && filters.tags.length > 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Art Gallery</h1>
          <p className="text-muted-foreground">Explore and manage your generated artwork collection</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Artworks</CardTitle>
                <Palette className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalArtworks}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Favorites</CardTitle>
                <Heart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalFavorites}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalByMode.ai}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Flow Visualizations</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalByMode.flow}</div>
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
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="h-5 w-5" />
                  Search
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search artworks..."
                  value={filters.search || ""}
                  onChange={(e) => updateFilter("search", e.target.value)}
                />
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filters
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Mode</label>
                  <Select value={filters.mode || "all"} onValueChange={(value) => updateFilter("mode", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="ai">AI Generated</SelectItem>
                      <SelectItem value="flow">Flow Visualizations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Dataset</label>
                  <Select value={filters.dataset || "all"} onValueChange={(value) => updateFilter("dataset", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="All datasets" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Datasets</SelectItem>
                      <SelectItem value="neural_networks">Neural Networks</SelectItem>
                      <SelectItem value="dna_sequences">DNA Sequences</SelectItem>
                      <SelectItem value="quantum_fields">Quantum Fields</SelectItem>
                      <SelectItem value="cosmic_phenomena">Cosmic Phenomena</SelectItem>
                      <SelectItem value="fractal_geometry">Fractal Geometry</SelectItem>
                      <SelectItem value="protein_folding">Protein Folding</SelectItem>
                      <SelectItem value="brain_connectivity">Brain Connectivity</SelectItem>
                      <SelectItem value="crystalline_structures">Crystalline Structures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Show</label>
                  <Select
                    value={
                      filters.isFavorite === undefined ? "all" : filters.isFavorite ? "favorites" : "non-favorites"
                    }
                    onValueChange={(value) =>
                      updateFilter("isFavorite", value === "all" ? undefined : value === "favorites")
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Artworks</SelectItem>
                      <SelectItem value="favorites">Favorites Only</SelectItem>
                      <SelectItem value="non-favorites">Non-favorites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Sort By</label>
                  <div className="flex gap-2">
                    <Select
                      value={filters.sortBy || "created_at"}
                      onValueChange={(value) => updateFilter("sortBy", value)}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Date Created</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="dataset">Dataset</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateFilter("sortOrder", filters.sortOrder === "asc" ? "desc" : "asc")}
                    >
                      {filters.sortOrder === "asc" ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>

                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>

            {/* Popular Tags */}
            {popularTags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Tag className="h-5 w-5" />
                    Popular Tags
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-1">
                    {popularTags.map(({ tag, count }) => (
                      <Badge
                        key={tag}
                        variant={filters.tags?.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer text-xs"
                        onClick={() => (filters.tags?.includes(tag) ? removeTagFilter(tag) : addTagFilter(tag))}
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
            {hasActiveFilters && (
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm font-medium">Active filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {filters.search && (
                    <Badge variant="secondary">
                      Search: "{filters.search}"
                      <button onClick={() => updateFilter("search", "")} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.mode !== "all" && (
                    <Badge variant="secondary">
                      Mode: {filters.mode}
                      <button onClick={() => updateFilter("mode", "all")} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.dataset !== "" && (
                    <Badge variant="secondary">
                      Dataset: {filters.dataset}
                      <button onClick={() => updateFilter("dataset", "")} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.isFavorite !== undefined && (
                    <Badge variant="secondary">
                      {filters.isFavorite ? "Favorites only" : "Non-favorites"}
                      <button onClick={() => updateFilter("isFavorite", undefined)} className="ml-1">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  )}
                  {filters.tags?.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      Tag: {tag}
                      <button onClick={() => removeTagFilter(tag)} className="ml-1">
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
            <GalleryGrid artworks={artworks} onArtworkUpdate={loadData} onArtworkView={setSelectedArtwork} />
          </div>
        </div>

        {/* Gallery Viewer */}
        <GalleryViewer
          artwork={selectedArtwork}
          open={!!selectedArtwork}
          onClose={() => setSelectedArtwork(null)}
          onUpdate={loadData}
          onDelete={loadData}
        />
      </div>
    </div>
  )
}
