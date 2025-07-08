"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Search, Filter, TrendingUp, Users, Palette, DollarSign, Verified } from "lucide-react"
import {
  getArtworks,
  getFeaturedArtworks,
  getArtists,
  getFeaturedCollections,
  getMarketplaceStats,
} from "@/lib/database"
import type { Artwork, Artist, Collection } from "@/lib/supabase"

interface MarketplaceStats {
  totalArtworks: number
  totalArtists: number
  totalTransactions: number
  totalVolume: number
}

export function FlowArtMarketplace() {
  const [artworks, setArtworks] = useState<(Artwork & { artist: Artist })[]>([])
  const [featuredArtworks, setFeaturedArtworks] = useState<(Artwork & { artist: Artist })[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [collections, setCollections] = useState<(Collection & { artist: Artist })[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalArtworks: 0,
    totalArtists: 0,
    totalTransactions: 0,
    totalVolume: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [rarityFilter, setRarityFilter] = useState<string>("all")
  const [datasetFilter, setDatasetFilter] = useState<string>("all")
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" })

  useEffect(() => {
    loadMarketplaceData()
  }, [])

  const loadMarketplaceData = async () => {
    try {
      setLoading(true)
      const [artworksData, featuredData, artistsData, collectionsData, statsData] = await Promise.all([
        getArtworks({ limit: 20 }),
        getFeaturedArtworks(6),
        getArtists({ limit: 10, verified: true }),
        getFeaturedCollections(5),
        getMarketplaceStats(),
      ])

      setArtworks(artworksData || [])
      setFeaturedArtworks(featuredData || [])
      setArtists(artistsData || [])
      setCollections(collectionsData || [])
      setStats(statsData)
    } catch (error) {
      console.error("Error loading marketplace data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    try {
      const filters: any = { limit: 20 }
      if (rarityFilter !== "all") filters.rarity = rarityFilter
      if (datasetFilter !== "all") filters.dataset = datasetFilter
      if (priceRange.min) filters.minPrice = Number.parseFloat(priceRange.min)
      if (priceRange.max) filters.maxPrice = Number.parseFloat(priceRange.max)

      const filteredArtworks = await getArtworks(filters)
      setArtworks(filteredArtworks || [])
    } catch (error) {
      console.error("Error searching artworks:", error)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "bg-gradient-to-r from-yellow-400 to-orange-500"
      case "Epic":
        return "bg-gradient-to-r from-purple-500 to-pink-500"
      case "Rare":
        return "bg-gradient-to-r from-blue-500 to-cyan-500"
      case "Common":
        return "bg-gradient-to-r from-gray-400 to-gray-600"
      default:
        return "bg-gray-500"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading FlowSketch Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                FlowSketch
              </h1>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300">
                Marketplace
              </Badge>
            </div>
            <nav className="hidden md:flex items-center space-x-6">
              <a href="#" className="hover:text-purple-400 transition-colors">
                Explore
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Artists
              </a>
              <a href="#" className="hover:text-purple-400 transition-colors">
                Collections
              </a>
              <Button
                variant="outline"
                className="border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white bg-transparent"
              >
                Connect Wallet
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Stats */}
      <section className="py-12 bg-gradient-to-b from-purple-900/20 to-black">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-4xl font-bold mb-4">Discover Generative Flow Art</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Explore unique algorithmic artworks created through mathematical beauty and computational creativity
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-500/20 rounded-lg mx-auto mb-2">
                <Palette className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-2xl font-bold">{stats.totalArtworks}</div>
              <div className="text-gray-400 text-sm">Artworks</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-lg mx-auto mb-2">
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-2xl font-bold">{stats.totalArtists}</div>
              <div className="text-gray-400 text-sm">Artists</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-lg mx-auto mb-2">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <div className="text-gray-400 text-sm">Sales</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-yellow-500/20 rounded-lg mx-auto mb-2">
                <DollarSign className="w-6 h-6 text-yellow-400" />
              </div>
              <div className="text-2xl font-bold">{stats.totalVolume.toFixed(1)}</div>
              <div className="text-gray-400 text-sm">ETH Volume</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Artworks */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h3 className="text-2xl font-bold mb-8 flex items-center">
            <TrendingUp className="w-6 h-6 mr-2 text-purple-400" />
            Featured Artworks
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtworks.map((artwork) => (
              <Card
                key={artwork.id}
                className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-all duration-300 group"
              >
                <div className="relative overflow-hidden">
                  <img
                    src={artwork.image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Badge className={`${getRarityColor(artwork.rarity)} text-white font-semibold`}>
                      {artwork.rarity}
                    </Badge>
                  </div>
                  <div className="absolute bottom-3 left-3 flex items-center space-x-2 text-white text-sm">
                    <div className="flex items-center space-x-1">
                      <Eye className="w-4 h-4" />
                      <span>{artwork.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="w-4 h-4" />
                      <span>{artwork.likes}</span>
                    </div>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-lg">{artwork.title}</h4>
                    <div className="text-right">
                      <div className="text-xl font-bold text-purple-400">{artwork.price} ETH</div>
                      <div className="text-xs text-gray-400">{artwork.edition}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mb-3">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{artwork.artist?.username[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-400">by {artwork.artist?.display_name}</span>
                    {artwork.artist?.verified && <Verified className="w-4 h-4 text-blue-400" />}
                  </div>
                  <p className="text-gray-400 text-sm mb-4 line-clamp-2">{artwork.description}</p>
                  <div className="flex space-x-2">
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Buy Now</Button>
                    <Button variant="outline" className="border-gray-600 hover:bg-gray-800 bg-transparent">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="artworks" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900">
              <TabsTrigger value="artworks">All Artworks</TabsTrigger>
              <TabsTrigger value="artists">Artists</TabsTrigger>
              <TabsTrigger value="collections">Collections</TabsTrigger>
            </TabsList>

            <TabsContent value="artworks" className="space-y-6">
              {/* Search and Filters */}
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <Input
                          placeholder="Search artworks..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 bg-gray-800 border-gray-700"
                        />
                      </div>
                    </div>
                    <Select value={rarityFilter} onValueChange={setRarityFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Rarity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rarities</SelectItem>
                        <SelectItem value="Legendary">Legendary</SelectItem>
                        <SelectItem value="Epic">Epic</SelectItem>
                        <SelectItem value="Rare">Rare</SelectItem>
                        <SelectItem value="Common">Common</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={datasetFilter} onValueChange={setDatasetFilter}>
                      <SelectTrigger className="bg-gray-800 border-gray-700">
                        <SelectValue placeholder="Dataset" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Datasets</SelectItem>
                        <SelectItem value="spirals">Spirals</SelectItem>
                        <SelectItem value="grid">Grid</SelectItem>
                        <SelectItem value="moons">Moons</SelectItem>
                        <SelectItem value="gaussian">Gaussian</SelectItem>
                        <SelectItem value="checkerboard">Checkerboard</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Artworks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {artworks.map((artwork) => (
                  <Card
                    key={artwork.id}
                    className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-all duration-300 group"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={artwork.image_url || "/placeholder.svg"}
                        alt={artwork.title}
                        className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2 right-2">
                        <Badge className={`${getRarityColor(artwork.rarity)} text-white text-xs`}>
                          {artwork.rarity}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <h4 className="font-semibold mb-1 truncate">{artwork.title}</h4>
                      <div className="flex items-center space-x-1 mb-2">
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">
                            {artwork.artist?.username[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-gray-400 truncate">{artwork.artist?.display_name}</span>
                        {artwork.artist?.verified && <Verified className="w-3 h-3 text-blue-400" />}
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-lg font-bold text-purple-400">{artwork.price} ETH</div>
                        <div className="flex items-center space-x-2 text-xs text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{artwork.views}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-3 h-3" />
                            <span>{artwork.likes}</span>
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="w-full bg-purple-600 hover:bg-purple-700">
                        Buy Now
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="artists" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {artists.map((artist) => (
                  <Card
                    key={artist.id}
                    className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-all duration-300"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <Avatar className="w-16 h-16">
                          <AvatarImage src={artist.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback className="text-lg">{artist.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-lg">{artist.display_name}</h3>
                            {artist.verified && <Verified className="w-5 h-5 text-blue-400" />}
                          </div>
                          <p className="text-gray-400 text-sm">@{artist.username}</p>
                        </div>
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{artist.bio}</p>
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-xl font-bold text-purple-400">{artist.total_artworks}</div>
                          <div className="text-xs text-gray-400">Artworks</div>
                        </div>
                        <div className="text-center">
                          <div className="text-xl font-bold text-green-400">{artist.total_sales} ETH</div>
                          <div className="text-xs text-gray-400">Total Sales</div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" className="flex-1 bg-purple-600 hover:bg-purple-700">
                          View Profile
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-gray-600 hover:bg-gray-800 bg-transparent"
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {collections.map((collection) => (
                  <Card
                    key={collection.id}
                    className="bg-gray-900 border-gray-800 hover:border-purple-500 transition-all duration-300"
                  >
                    <div className="relative overflow-hidden">
                      <img
                        src={collection.banner_url || "/placeholder.svg?height=200&width=400"}
                        alt={collection.name}
                        className="w-full h-48 object-cover"
                      />
                      {collection.is_featured && (
                        <div className="absolute top-3 left-3">
                          <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">Featured</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-xl mb-2">{collection.name}</h3>
                      <div className="flex items-center space-x-2 mb-3">
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={collection.artist?.avatar_url || "/placeholder.svg"} />
                          <AvatarFallback>{collection.artist?.username[0]?.toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm text-gray-400">by {collection.artist?.display_name}</span>
                        {collection.artist?.verified && <Verified className="w-4 h-4 text-blue-400" />}
                      </div>
                      <p className="text-gray-400 text-sm mb-4 line-clamp-3">{collection.description}</p>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700">Explore Collection</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  )
}
