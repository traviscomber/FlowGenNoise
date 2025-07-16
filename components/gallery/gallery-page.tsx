"use client"

import { useEffect, useState, useCallback } from "react"
import { GalleryService, type ArtworkData, type GalleryFilters } from "@/lib/gallery-service"
import { GalleryGrid } from "./gallery-grid"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Loader2, Search, Heart, Sparkles, Zap, Filter, XCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export function GalleryPage() {
  const [artworks, setArtworks] = useState<ArtworkData[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<GalleryFilters>({
    mode: "all",
    isFavorite: undefined,
    search: "",
    dataset: "",
    scenario: "",
    tags: [],
  })
  const [popularTags, setPopularTags] = useState<Array<{ tag: string; count: number }>>([])
  const [allDatasets, setAllDatasets] = useState<string[]>([])
  const [allScenarios, setAllScenarios] = useState<string[]>([])

  const fetchArtworks = useCallback(async () => {
    setLoading(true)
    try {
      const fetchedArtworks = await GalleryService.getArtworks(filters)
      setArtworks(fetchedArtworks)

      // Extract unique datasets and scenarios for filter options
      const datasets = new Set<string>()
      const scenarios = new Set<string>()
      fetchedArtworks.forEach((artwork) => {
        datasets.add(artwork.dataset)
        scenarios.add(artwork.scenario)
      })
      setAllDatasets(Array.from(datasets).sort())
      setAllScenarios(Array.from(scenarios).sort())
    } catch (error) {
      console.error("Failed to fetch artworks:", error)
    } finally {
      setLoading(false)
    }
  }, [filters])

  const fetchPopularTags = useCallback(async () => {
    try {
      const tags = await GalleryService.getPopularTags(10)
      setPopularTags(tags)
    } catch (error) {
      console.error("Failed to fetch popular tags:", error)
    }
  }, [])

  useEffect(() => {
    fetchArtworks()
    fetchPopularTags()
  }, [fetchArtworks, fetchPopularTags])

  const handleFilterChange = (key: keyof GalleryFilters, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleTagToggle = (tag: string) => {
    setFilters((prev) => {
      const currentTags = prev.tags || []
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter((t) => t !== tag) }
      } else {
        return { ...prev, tags: [...currentTags, tag] }
      }
    })
  }

  const clearFilters = () => {
    setFilters({
      mode: "all",
      isFavorite: undefined,
      search: "",
      dataset: "",
      scenario: "",
      tags: [],
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
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Your Art Gallery
          </h1>
          <p className="text-muted-foreground">Browse and manage your generated artworks.</p>
        </div>
        <Button variant="outline" asChild>
          <a href="/">
            <Zap className="mr-2 h-4 w-4" />
            Generate New Art
          </a>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        {/* Sidebar Filters */}
        <Card className="h-fit sticky top-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Filter className="h-5 w-5" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by title or description..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            {/* Mode Filter */}
            <div className="space-y-2">
              <Label htmlFor="mode">Mode</Label>
              <Select value={filters.mode} onValueChange={(value) => handleFilterChange("mode", value)}>
                <SelectTrigger id="mode">
                  <SelectValue placeholder="All Modes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Modes</SelectItem>
                  <SelectItem value="flow">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Flow Field
                    </div>
                  </SelectItem>
                  <SelectItem value="ai">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      AI Generated
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Dataset Filter */}
            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={filters.dataset} onValueChange={(value) => handleFilterChange("dataset", value)}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="All Datasets" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Datasets</SelectItem>
                  {allDatasets.map((ds) => (
                    <SelectItem key={ds} value={ds}>
                      {ds.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Scenario Filter */}
            <div className="space-y-2">
              <Label htmlFor="scenario">Scenario</Label>
              <Select value={filters.scenario} onValueChange={(value) => handleFilterChange("scenario", value)}>
                <SelectTrigger id="scenario">
                  <SelectValue placeholder="All Scenarios" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Scenarios</SelectItem>
                  {allScenarios.map((sc) => (
                    <SelectItem key={sc} value={sc}>
                      {sc.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Favorites Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={filters.isFavorite || false}
                onChange={(e) => handleFilterChange("isFavorite", e.target.checked || undefined)}
                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
              />
              <Label htmlFor="isFavorite" className="flex items-center gap-1">
                <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                Show Favorites
              </Label>
            </div>

            <Separator />

            {/* Popular Tags */}
            <div className="space-y-2">
              <Label>Popular Tags</Label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map((tag) => (
                  <Badge
                    key={tag.tag}
                    variant={filters.tags?.includes(tag.tag) ? "default" : "outline"}
                    className="cursor-pointer"
                    onClick={() => handleTagToggle(tag.tag)}
                  >
                    {tag.tag} ({tag.count})
                  </Badge>
                ))}
              </div>
            </div>

            {hasActiveFilters && (
              <Button variant="outline" onClick={clearFilters} className="w-full bg-transparent">
                <XCircle className="mr-2 h-4 w-4" />
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Artwork Grid */}
        <div>
          {loading ? (
            <div className="flex items-center justify-center h-96">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="sr-only">Loading artworks...</span>
            </div>
          ) : (
            <GalleryGrid
              artworks={artworks}
              onArtworkUpdate={(updatedArtwork) => {
                setArtworks((prev) => prev.map((art) => (art.id === updatedArtwork.id ? updatedArtwork : art)))
              }}
              onArtworkDelete={(deletedId) => {
                setArtworks((prev) => prev.filter((art) => art.id !== deletedId))
              }}
            />
          )}
        </div>
      </div>
    </div>
  )
}
