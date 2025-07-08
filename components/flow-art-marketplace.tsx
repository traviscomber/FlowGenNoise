"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Search, TrendingUp, Users, Palette, Zap } from "lucide-react"
import {
  getArtworks,
  getFeaturedArtworks,
  getArtists,
  getFeaturedCollections,
  getMarketplaceStats,
} from "@/lib/database"
import type { Artwork, Artist } from "@/lib/supabase"

interface MarketplaceStats {
  totalArtworks: number
  totalArtists: number
  totalTransactions: number
  totalVolume: number
}

export default function FlowArtMarketplace() {
  const [artworks, setArtworks] = useState<(Artwork & { artist: Artist })[]>([])
  const [featuredArtworks, setFeaturedArtworks] = useState<(Artwork & { artist: Artist })[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [collections, setCollections] = useState<any[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalArtworks: 0,
    totalArtists: 0,
    totalTransactions: 0,
    totalVolume: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRarity, setSelectedRarity] = useState<string>("all")
  const [selectedDataset, setSelectedDataset] = useState<string>("all")
  const [sortBy, setSortBy] = useState<"created_at" | "price" | "views" | "likes">("created_at")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    loadData()
  }, [searchTerm, selectedRarity, selectedDataset, sortBy, sortOrder])

  const loadData = async () => {
    try {
      setLoading(true)

      // Build filter options
      const filterBy: any = {}
      if (selectedRarity !== "all") filterBy.rarity = selectedRarity
      if (selectedDataset !== "all") filterBy.dataset = selectedDataset

      // Load all data in parallel
      const [artworksData, featuredData, artistsData, collectionsData, statsData] = await Promise.all([
        getArtworks({
          limit: 20,
          search: searchTerm || undefined,
          filterBy: Object.keys(filterBy).length > 0 ? filterBy : undefined,
          sortBy,
          sortOrder,
        }),
        getFeaturedArtworks(6),
        getArtists({ limit: 10, verified: true }),
        getFeaturedCollections(5),
        getMarketplaceStats(),
      ])

      setArtworks(artworksData)
      setFeaturedArtworks(featuredData)
      setArtists(artistsData)
      setCollections(collectionsData)
      setStats(statsData)
    } catch (error) {
      console.error("Error loading marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500 text-white"
      case "Epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500 text-white"
      case "Rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const formatPrice = (price: number) => {
    return `${price.toFixed(2)} ETH`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}k`
    }
    return num.toString()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold text-white">FlowSketch</h1>
              </div>
              <Badge variant="secondary" className="bg-purple-500/20 text-purple-300 border-purple-500/30">
                Marketplace
              </Badge>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                Explore
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                Artists
              </a>
              <a href="#" className="text-slate-300 hover:text-white transition-colors">
                Collections
              </a>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                Connect Wallet
              </Button>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Hero Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-slate-400">Artworks</p>
                  <p className="text-xl font-bold text-white">{stats.totalArtworks}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-slate-400">Artists</p>
                  <p className="text-xl font-bold text-white">{stats.totalArtists}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-slate-400">Sales</p>
                  <p className="text-xl font-bold text-white">{stats.totalTransactions}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-slate-800/50 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-slate-400">Volume</p>
                  <p className="text-xl font-bold text-white">{stats.totalVolume.toFixed(1)} ETH</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Artworks */}
        {featuredArtworks.length > 0 && (
          <section className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-6">Featured Artworks</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredArtworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={artwork.image_url || "/placeholder.svg"}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getRarityColor(artwork.rarity)}>{artwork.rarity}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Badge variant="secondary" className="bg-black/50 text-white border-none">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatNumber(artwork.views)}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-none">
                        <Heart className="w-3 h-3 mr-1" />
                        {formatNumber(artwork.likes)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{artwork.artist?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-400">
                        {artwork.artist?.display_name || artwork.artist?.username}
                      </span>
                      {artwork.artist?.verified && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="font-bold text-white">{formatPrice(artwork.price)}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Main Content */}
        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList className="bg-slate-800/50 border-slate-700">
            <TabsTrigger value="artworks" className="data-[state=active]:bg-purple-500">
              Artworks
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-purple-500">
              Artists
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-purple-500">
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="space-y-6">
            {/* Filters */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                      <Input
                        placeholder="Search artworks..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-slate-700/50 border-slate-600 text-white placeholder-slate-400"
                      />
                    </div>
                  </div>
                  <Select value={selectedRarity} onValueChange={setSelectedRarity}>
                    <SelectTrigger className="w-full md:w-40 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Rarities</SelectItem>
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedDataset} onValueChange={setSelectedDataset}>
                    <SelectTrigger className="w-full md:w-40 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Dataset" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="all">All Datasets</SelectItem>
                      <SelectItem value="spiral">Spirals</SelectItem>
                      <SelectItem value="grid">Grids</SelectItem>
                      <SelectItem value="celestial">Celestial</SelectItem>
                      <SelectItem value="probability">Probability</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={`${sortBy}-${sortOrder}`}
                    onValueChange={(value) => {
                      const [newSortBy, newSortOrder] = value.split("-") as [typeof sortBy, typeof sortOrder]
                      setSortBy(newSortBy)
                      setSortOrder(newSortOrder)
                    }}
                  >
                    <SelectTrigger className="w-full md:w-40 bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="created_at-desc">Newest</SelectItem>
                      <SelectItem value="created_at-asc">Oldest</SelectItem>
                      <SelectItem value="price-desc">Price: High to Low</SelectItem>
                      <SelectItem value="price-asc">Price: Low to High</SelectItem>
                      <SelectItem value="views-desc">Most Viewed</SelectItem>
                      <SelectItem value="likes-desc">Most Liked</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="bg-slate-800/50 border-slate-700 overflow-hidden group hover:bg-slate-800/70 transition-all duration-300"
                >
                  <div className="aspect-square relative overflow-hidden">
                    <img
                      src={artwork.image_url || "/placeholder.svg"}
                      alt={artwork.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className={getRarityColor(artwork.rarity)}>{artwork.rarity}</Badge>
                    </div>
                    <div className="absolute top-3 right-3 flex space-x-2">
                      <Badge variant="secondary" className="bg-black/50 text-white border-none">
                        <Eye className="w-3 h-3 mr-1" />
                        {formatNumber(artwork.views)}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/50 text-white border-none">
                        <Heart className="w-3 h-3 mr-1" />
                        {formatNumber(artwork.likes)}
                      </Badge>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{artwork.artist?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-400">
                        {artwork.artist?.display_name || artwork.artist?.username}
                      </span>
                      {artwork.artist?.verified && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2 line-clamp-1">{artwork.title}</h3>
                    <p className="text-sm text-slate-400 mb-3 line-clamp-2">{artwork.description}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-slate-500">Price</p>
                        <p className="font-bold text-white">{formatPrice(artwork.price)}</p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Buy Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="artists" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {artists.map((artist) => (
                <Card key={artist.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <div className="h-32 bg-gradient-to-r from-purple-500/20 to-pink-500/20 relative">
                    {artist.banner_url && (
                      <img
                        src={artist.banner_url || "/placeholder.svg"}
                        alt={`${artist.display_name} banner`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <CardContent className="p-4 -mt-8 relative">
                    <div className="flex items-start space-x-4">
                      <Avatar className="w-16 h-16 border-4 border-slate-800">
                        <AvatarImage src={artist.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{artist.username.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 pt-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold text-white">{artist.display_name || artist.username}</h3>
                          {artist.verified && (
                            <Badge
                              variant="secondary"
                              className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs"
                            >
                              ✓
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-400">@{artist.username}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-300 mt-3 line-clamp-2">{artist.bio}</p>
                    <div className="flex items-center justify-between mt-4">
                      <div className="flex space-x-4">
                        <div>
                          <p className="text-xs text-slate-500">Artworks</p>
                          <p className="font-semibold text-white">{artist.total_artworks}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Sales</p>
                          <p className="font-semibold text-white">{artist.total_sales.toFixed(1)} ETH</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
                      >
                        Follow
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card key={collection.id} className="bg-slate-800/50 border-slate-700 overflow-hidden">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src={collection.banner_url || "/placeholder.svg"}
                      alt={collection.name}
                      className="w-full h-full object-cover"
                    />
                    {collection.is_featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Featured</Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={collection.artist?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback>{collection.artist?.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-slate-400">
                        {collection.artist?.display_name || collection.artist?.username}
                      </span>
                      {collection.artist?.verified && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30 text-xs">
                          ✓
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-white mb-2">{collection.name}</h3>
                    <p className="text-sm text-slate-400 mb-4 line-clamp-2">{collection.description}</p>
                    <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                      View Collection
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
