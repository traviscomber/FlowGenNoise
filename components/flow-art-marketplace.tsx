"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Search, Heart, Share2, TrendingUp, Filter, Eye, Loader2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  getArtworks,
  getFeaturedArtworks,
  toggleArtworkLike,
  recordArtworkView,
  createTransaction,
} from "@/lib/database"
import type { Artwork, Artist } from "@/lib/supabase"

export function FlowArtMarketplace() {
  const [artworks, setArtworks] = useState<(Artwork & { artist: Artist })[]>([])
  const [featuredArtwork, setFeaturedArtwork] = useState<(Artwork & { artist: Artist }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<string>("views")
  const [filterBy, setFilterBy] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState<string>("")

  // Mock user ID - in real app this would come from authentication
  const currentUserId = "880e8400-e29b-41d4-a716-446655440001"

  useEffect(() => {
    loadArtworks()
    loadFeaturedArtwork()
  }, [sortBy, filterBy, searchQuery])

  const loadArtworks = async () => {
    try {
      setLoading(true)
      const data = await getArtworks({
        limit: 20,
        sortBy: sortBy === "trending" ? "views" : (sortBy as any),
        sortOrder: "desc",
        filterBy: filterBy === "all" ? undefined : { dataset: filterBy },
        search: searchQuery || undefined,
      })
      setArtworks(data)
    } catch (error) {
      console.error("Error loading artworks:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadFeaturedArtwork = async () => {
    try {
      const featured = await getFeaturedArtworks(1)
      if (featured.length > 0) {
        setFeaturedArtwork(featured[0])
      }
    } catch (error) {
      console.error("Error loading featured artwork:", error)
    }
  }

  const handleLike = async (artworkId: string) => {
    try {
      const isLiked = await toggleArtworkLike(artworkId, currentUserId)

      // Update local state
      setArtworks((prev) =>
        prev.map((artwork) =>
          artwork.id === artworkId
            ? {
                ...artwork,
                is_liked: isLiked,
                likes: isLiked ? artwork.likes + 1 : artwork.likes - 1,
              }
            : artwork,
        ),
      )

      if (featuredArtwork?.id === artworkId) {
        setFeaturedArtwork((prev) =>
          prev
            ? {
                ...prev,
                is_liked: isLiked,
                likes: isLiked ? prev.likes + 1 : prev.likes - 1,
              }
            : null,
        )
      }
    } catch (error) {
      console.error("Error toggling like:", error)
    }
  }

  const handleBuy = async (artwork: Artwork & { artist: Artist }) => {
    try {
      // Record the transaction
      await createTransaction({
        artwork_id: artwork.id,
        seller_id: artwork.artist_id,
        buyer_id: currentUserId,
        price: artwork.price,
        currency: artwork.currency,
        status: "pending",
      })

      alert(`Purchase initiated for ${artwork.title}! Transaction is being processed.`)
      // In a real app, this would integrate with Web3 wallet and smart contracts
    } catch (error) {
      console.error("Error creating transaction:", error)
      alert("Failed to initiate purchase. Please try again.")
    }
  }

  const handleArtworkClick = async (artwork: Artwork & { artist: Artist }) => {
    // Record view
    await recordArtworkView(artwork.id, currentUserId)

    // Update featured artwork
    setFeaturedArtwork(artwork)

    // Update view count in local state
    setArtworks((prev) => prev.map((art) => (art.id === artwork.id ? { ...art, views: art.views + 1 } : art)))
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case "Legendary":
        return "from-yellow-500 to-orange-500"
      case "Epic":
        return "from-purple-500 to-pink-500"
      case "Rare":
        return "from-blue-500 to-cyan-500"
      default:
        return "from-gray-500 to-gray-600"
    }
  }

  if (loading && artworks.length === 0) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">FS</span>
                </div>
                <span className="text-xl font-bold">FlowSketch</span>
              </div>
              <nav className="hidden md:flex space-x-6">
                <button className="text-white font-medium">EXPLORE</button>
                <button className="text-gray-300 hover:text-white transition-colors">ARTISTS</button>
                <button className="text-gray-300 hover:text-white transition-colors">COLLECTIONS</button>
                <button className="text-gray-300 hover:text-white transition-colors">EXHIBITIONS</button>
                <button className="text-gray-300 hover:text-white transition-colors">SALES</button>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gray-900 rounded-full px-4 py-2">
                <Search className="w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="artworks, artists, collections..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-sm text-white placeholder-gray-400 outline-none w-64"
                />
              </div>
              <Button className="bg-white text-black hover:bg-gray-200">Connect Wallet</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      {featuredArtwork && (
        <section className="relative h-screen flex items-center justify-center overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${featuredArtwork.image_url})`,
            }}
          >
            <div className="absolute inset-0 bg-black/50" />
          </div>

          <div className="relative z-10 text-center max-w-4xl mx-auto px-4">
            <h1 className="text-5xl md:text-7xl font-bold mb-4">{featuredArtwork.title}</h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-2">
              by {featuredArtwork.artist.display_name || featuredArtwork.artist.username}
            </p>
            <p className="text-lg text-gray-400 mb-8 max-w-2xl mx-auto">{featuredArtwork.description}</p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
              <Badge
                className={`bg-gradient-to-r ${getRarityColor(featuredArtwork.rarity)} text-white px-4 py-2 text-lg`}
              >
                {featuredArtwork.rarity} • {featuredArtwork.edition}
              </Badge>

              <div className="flex items-center space-x-4 text-gray-300">
                <div className="flex items-center space-x-1">
                  <Eye className="w-4 h-4" />
                  <span>{featuredArtwork.views.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Heart className={`w-4 h-4 ${featuredArtwork.is_liked ? "fill-red-500 text-red-500" : ""}`} />
                  <span>{featuredArtwork.likes}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <div className="text-3xl font-bold">
                {featuredArtwork.price} {featuredArtwork.currency}
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => handleBuy(featuredArtwork)}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 px-8 py-3 text-lg"
                >
                  Buy Now
                </Button>

                <Button
                  onClick={() => handleLike(featuredArtwork.id)}
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-6 py-3"
                >
                  <Heart className={`w-5 h-5 mr-2 ${featuredArtwork.is_liked ? "fill-current" : ""}`} />
                  {featuredArtwork.is_liked ? "Liked" : "Like"}
                </Button>

                <Button
                  variant="outline"
                  className="border-white text-white hover:bg-white hover:text-black px-6 py-3 bg-transparent"
                >
                  <Share2 className="w-5 h-5 mr-2" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Filters and Sorting */}
      <section className="border-b border-gray-800 bg-gray-900/30 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <Select value={filterBy} onValueChange={setFilterBy}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All Datasets</SelectItem>
                    <SelectItem value="spirals">Spirals</SelectItem>
                    <SelectItem value="checkerboard">Checkerboard</SelectItem>
                    <SelectItem value="moons">Moons</SelectItem>
                    <SelectItem value="gaussian">Gaussian</SelectItem>
                    <SelectItem value="grid">Grid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-gray-400 text-sm">{artworks.length} artworks</span>
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-gray-400" />
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="bg-gray-800 border-gray-700 text-white w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="views">Trending</SelectItem>
                    <SelectItem value="price">Price: High to Low</SelectItem>
                    <SelectItem value="likes">Most Liked</SelectItem>
                    <SelectItem value="created_at">Recently Listed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold mb-8">Featured Artworks</h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="bg-gray-900 border-gray-800 overflow-hidden">
                  <div className="aspect-square bg-gray-800 animate-pulse" />
                  <CardContent className="p-4">
                    <div className="h-4 bg-gray-800 rounded animate-pulse mb-2" />
                    <div className="h-3 bg-gray-800 rounded animate-pulse w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {artworks.map((artwork) => (
                <Card
                  key={artwork.id}
                  className="bg-gray-900 border-gray-800 overflow-hidden hover:border-gray-600 transition-all duration-300 cursor-pointer group hover:scale-105"
                  onClick={() => handleArtworkClick(artwork)}
                >
                  <div className="relative aspect-square">
                    <img
                      src={artwork.image_url || "/placeholder.svg"}
                      alt={artwork.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2">
                      <Badge className={`bg-gradient-to-r ${getRarityColor(artwork.rarity)} text-white`}>
                        {artwork.rarity}
                      </Badge>
                    </div>
                    <div className="absolute top-2 right-2">
                      <Badge className="bg-black/70 text-white">{artwork.edition}</Badge>
                    </div>

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuy(artwork)
                        }}
                        className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Buy for {artwork.price} {artwork.currency}
                      </Button>
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-1">{artwork.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">
                      by {artwork.artist.display_name || artwork.artist.username}
                    </p>

                    <div className="flex items-center justify-between mb-3">
                      <div className="text-xl font-bold">
                        {artwork.price} {artwork.currency}
                      </div>
                      <div className="flex items-center space-x-3 text-sm text-gray-400">
                        <div className="flex items-center space-x-1">
                          <Eye className="w-3 h-3" />
                          <span>{artwork.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className={`w-3 h-3 ${artwork.is_liked ? "fill-red-500 text-red-500" : ""}`} />
                          <span>{artwork.likes}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBuy(artwork)
                        }}
                        className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
                      >
                        Buy Now
                      </Button>

                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(artwork.id)
                        }}
                        className="border-gray-600 text-gray-300 hover:bg-gray-800"
                      >
                        <Heart className={`w-3 h-3 ${artwork.is_liked ? "fill-current text-red-500" : ""}`} />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
