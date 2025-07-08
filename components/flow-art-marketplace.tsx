"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Eye, Zap, TrendingUp, Users, Palette, Star, Verified, ExternalLink, ShoppingCart } from "lucide-react"
import {
  getArtworks,
  getFeaturedArtworks,
  getArtists,
  getFeaturedCollections,
  getMarketplaceStats,
  type Artwork,
  type Artist,
  type Collection,
  type MarketplaceStats,
} from "@/lib/database"
import { WalletConnectButton } from "./wallet-connect-button"
import { PurchaseModal } from "./purchase-modal"
import { useWeb3 } from "@/lib/web3-context"
import { useToast } from "@/hooks/use-toast"

const rarityColors = {
  Common: "bg-gray-500",
  Rare: "bg-blue-500",
  Epic: "bg-purple-500",
  Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
}

const rarityGradients = {
  Common: "from-gray-400 to-gray-600",
  Rare: "from-blue-400 to-blue-600",
  Epic: "from-purple-400 to-purple-600",
  Legendary: "from-yellow-400 via-orange-500 to-red-500",
}

export default function FlowArtMarketplace() {
  const [artworks, setArtworks] = useState<Artwork[]>([])
  const [featuredArtworks, setFeaturedArtworks] = useState<Artwork[]>([])
  const [artists, setArtists] = useState<Artist[]>([])
  const [collections, setCollections] = useState<Collection[]>([])
  const [stats, setStats] = useState<MarketplaceStats>({
    totalArtworks: 0,
    totalArtists: 0,
    totalSales: 0,
    totalVolume: 0,
  })
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    rarity: "",
    dataset: "",
    minPrice: "",
    maxPrice: "",
    search: "",
  })
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false)

  const { isConnected } = useWeb3()
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    loadArtworks()
  }, [filters])

  const loadData = async () => {
    try {
      setLoading(true)
      const [artworksData, featuredData, artistsData, collectionsData, statsData] = await Promise.all([
        getArtworks({ limit: 12 }),
        getFeaturedArtworks(6),
        getArtists(6),
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
      toast({
        title: "Error loading data",
        description: "Failed to load marketplace data. Please refresh the page.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadArtworks = async () => {
    try {
      const filterParams: any = { limit: 12 }

      if (filters.rarity) filterParams.rarity = filters.rarity
      if (filters.dataset) filterParams.dataset = filters.dataset
      if (filters.minPrice) filterParams.minPrice = Number.parseFloat(filters.minPrice)
      if (filters.maxPrice) filterParams.maxPrice = Number.parseFloat(filters.maxPrice)

      const data = await getArtworks(filterParams)
      setArtworks(data)
    } catch (error) {
      console.error("Error loading filtered artworks:", error)
    }
  }

  const handlePurchaseClick = (artwork: Artwork) => {
    if (!isConnected) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase artworks",
        variant: "destructive",
      })
      return
    }

    if (artwork.status !== "available") {
      toast({
        title: "Artwork unavailable",
        description: "This artwork is no longer available for purchase",
        variant: "destructive",
      })
      return
    }

    setSelectedArtwork(artwork)
    setIsPurchaseModalOpen(true)
  }

  const handlePurchaseSuccess = () => {
    // Refresh the data to reflect the purchase
    loadData()
    toast({
      title: "Purchase successful!",
      description: "The artwork has been transferred to your wallet",
    })
  }

  const clearFilters = () => {
    setFilters({
      rarity: "",
      dataset: "",
      minPrice: "",
      maxPrice: "",
      search: "",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading FlowSketch Marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  FlowSketch
                </h1>
              </div>
              <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                Marketplace
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Palette className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-sm text-gray-400">Artworks</p>
                  <p className="text-xl font-bold">{stats.totalArtworks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Users className="w-5 h-5 text-purple-400" />
                <div>
                  <p className="text-sm text-gray-400">Artists</p>
                  <p className="text-xl font-bold">{stats.totalArtists.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-400" />
                <div>
                  <p className="text-sm text-gray-400">Sales</p>
                  <p className="text-xl font-bold">{stats.totalSales.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-gray-900/50 border-gray-800">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5 text-yellow-400" />
                <div>
                  <p className="text-sm text-gray-400">Volume</p>
                  <p className="text-xl font-bold">{stats.totalVolume.toFixed(1)} ETH</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Artworks */}
        <section className="mb-12">
          <div className="flex items-center space-x-2 mb-6">
            <Star className="w-6 h-6 text-yellow-400" />
            <h2 className="text-2xl font-bold">Featured Artworks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredArtworks.map((artwork) => (
              <Card
                key={artwork.id}
                className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 group overflow-hidden"
              >
                <div className="relative">
                  <img
                    src={artwork.image_url || "/placeholder.svg"}
                    alt={artwork.title}
                    className="w-full h-64 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3">
                    <Badge className={`${rarityColors[artwork.rarity]} text-white border-0`}>{artwork.rarity}</Badge>
                  </div>
                  <div className="absolute top-3 right-3 flex space-x-2">
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      <Eye className="w-3 h-3 mr-1" />
                      {artwork.views.toLocaleString()}
                    </Badge>
                    <Badge variant="secondary" className="bg-black/50 text-white border-0">
                      <Heart className="w-3 h-3 mr-1" />
                      {artwork.likes}
                    </Badge>
                  </div>
                  {artwork.status !== "available" && (
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                      <Badge variant="secondary" className="bg-red-600 text-white">
                        {artwork.status === "sold" ? "SOLD" : "UNAVAILABLE"}
                      </Badge>
                    </div>
                  )}
                </div>
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                      <AvatarFallback>{artwork.artist?.username?.[0]?.toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-gray-400">{artwork.artist?.username}</span>
                    {artwork.artist?.verified && <Verified className="w-4 h-4 text-blue-400" />}
                  </div>
                  <h3 className="font-semibold mb-2 group-hover:text-blue-400 transition-colors">{artwork.title}</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400">Price</p>
                      <p className="font-bold text-lg">
                        {artwork.price} {artwork.currency}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => handlePurchaseClick(artwork)}
                      disabled={artwork.status !== "available"}
                    >
                      <ShoppingCart className="w-4 h-4 mr-1" />
                      {artwork.status === "available" ? "Buy Now" : "Sold"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Main Content Tabs */}
        <Tabs defaultValue="artworks" className="space-y-6">
          <TabsList className="bg-gray-900/50 border border-gray-800">
            <TabsTrigger value="artworks" className="data-[state=active]:bg-blue-600">
              All Artworks
            </TabsTrigger>
            <TabsTrigger value="artists" className="data-[state=active]:bg-blue-600">
              Artists
            </TabsTrigger>
            <TabsTrigger value="collections" className="data-[state=active]:bg-blue-600">
              Collections
            </TabsTrigger>
          </TabsList>

          <TabsContent value="artworks" className="space-y-6">
            {/* Filters */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle className="text-lg">Filters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <Select
                    value={filters.rarity}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, rarity: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Rarity" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="Common">Common</SelectItem>
                      <SelectItem value="Rare">Rare</SelectItem>
                      <SelectItem value="Epic">Epic</SelectItem>
                      <SelectItem value="Legendary">Legendary</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select
                    value={filters.dataset}
                    onValueChange={(value) => setFilters((prev) => ({ ...prev, dataset: value }))}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700">
                      <SelectValue placeholder="Dataset" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="spirals">Spirals</SelectItem>
                      <SelectItem value="grid">Grid</SelectItem>
                      <SelectItem value="moons">Moons</SelectItem>
                      <SelectItem value="gaussian">Gaussian</SelectItem>
                      <SelectItem value="checkerboard">Checkerboard</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    placeholder="Min Price (ETH)"
                    value={filters.minPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, minPrice: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />

                  <Input
                    placeholder="Max Price (ETH)"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters((prev) => ({ ...prev, maxPrice: e.target.value }))}
                    className="bg-gray-800 border-gray-700"
                  />

                  <Button
                    onClick={clearFilters}
                    variant="outline"
                    className="border-gray-700 hover:bg-gray-800 bg-transparent"
                  >
                    Clear Filters
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Artworks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {artworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 group overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={artwork.image_url || "/placeholder.svg"}
                      alt={artwork.title}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge
                        className={`bg-gradient-to-r ${rarityGradients[artwork.rarity]} text-white border-0 text-xs`}
                      >
                        {artwork.rarity}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs">
                        <Eye className="w-3 h-3 mr-1" />
                        {artwork.views > 1000 ? `${(artwork.views / 1000).toFixed(1)}k` : artwork.views}
                      </Badge>
                      <Badge variant="secondary" className="bg-black/60 text-white border-0 text-xs">
                        <Heart className="w-3 h-3 mr-1" />
                        {artwork.likes}
                      </Badge>
                    </div>
                    {artwork.status !== "available" && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <Badge variant="secondary" className="bg-red-600 text-white">
                          {artwork.status === "sold" ? "SOLD" : "UNAVAILABLE"}
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <div className="flex items-center space-x-2 mb-2">
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {artwork.artist?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs text-gray-400 truncate">{artwork.artist?.username}</span>
                      {artwork.artist?.verified && <Verified className="w-3 h-3 text-blue-400 flex-shrink-0" />}
                    </div>
                    <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-400 transition-colors truncate">
                      {artwork.title}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2">{artwork.edition}</p>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-gray-400">Price</p>
                        <p className="font-bold text-sm">
                          {artwork.price} {artwork.currency}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700 text-xs px-3 py-1"
                        onClick={() => handlePurchaseClick(artwork)}
                        disabled={artwork.status !== "available"}
                      >
                        <ShoppingCart className="w-3 h-3 mr-1" />
                        {artwork.status === "available" ? "Buy" : "Sold"}
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
                <Card
                  key={artist.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <Avatar className="w-16 h-16">
                        <AvatarImage src={artist.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-lg">{artist.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-semibold">{artist.display_name || artist.username}</h3>
                          {artist.verified && <Verified className="w-4 h-4 text-blue-400" />}
                        </div>
                        <p className="text-sm text-gray-400">@{artist.username}</p>
                      </div>
                    </div>

                    {artist.bio && <p className="text-sm text-gray-300 mb-4 line-clamp-2">{artist.bio}</p>}

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">Artworks</p>
                        <p className="font-semibold">{artist.total_artworks}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Total Sales</p>
                        <p className="font-semibold">{artist.total_sales.toFixed(2)} ETH</p>
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
                        View Profile
                      </Button>
                      <Button size="sm" variant="outline" className="border-gray-700 hover:bg-gray-800 bg-transparent">
                        Follow
                      </Button>
                    </div>

                    {(artist.website_url || artist.twitter_handle) && (
                      <div className="flex space-x-2 mt-3 pt-3 border-t border-gray-800">
                        {artist.website_url && (
                          <Button size="sm" variant="ghost" className="p-1 h-auto">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                        {artist.twitter_handle && (
                          <Button size="sm" variant="ghost" className="p-1 h-auto">
                            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                            </svg>
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="collections" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {collections.map((collection) => (
                <Card
                  key={collection.id}
                  className="bg-gray-900/50 border-gray-800 hover:border-gray-700 transition-all duration-300 group overflow-hidden"
                >
                  <div className="relative">
                    <img
                      src={collection.banner_url || "/placeholder.svg?height=200&width=400"}
                      alt={collection.name}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {collection.is_featured && (
                      <div className="absolute top-3 left-3">
                        <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-0">
                          <Star className="w-3 h-3 mr-1" />
                          Featured
                        </Badge>
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-lg mb-2 group-hover:text-blue-400 transition-colors">
                      {collection.name}
                    </h3>

                    <div className="flex items-center space-x-2 mb-3">
                      <Avatar className="w-6 h-6">
                        <AvatarImage src={collection.artist?.avatar_url || "/placeholder.svg"} />
                        <AvatarFallback className="text-xs">
                          {collection.artist?.username?.[0]?.toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm text-gray-400">by {collection.artist?.username}</span>
                      {collection.artist?.verified && <Verified className="w-4 h-4 text-blue-400" />}
                    </div>

                    {collection.description && (
                      <p className="text-sm text-gray-300 mb-4 line-clamp-2">{collection.description}</p>
                    )}

                    <Button className="w-full bg-blue-600 hover:bg-blue-700">View Collection</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Purchase Modal */}
      <PurchaseModal
        artwork={selectedArtwork}
        isOpen={isPurchaseModalOpen}
        onClose={() => setIsPurchaseModalOpen(false)}
        onSuccess={handlePurchaseSuccess}
      />
    </div>
  )
}
