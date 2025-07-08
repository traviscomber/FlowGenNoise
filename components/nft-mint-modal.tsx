"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/lib/web3-context"
import { uploadToIPFS, uploadMetadataToIPFS, createNFTMetadata } from "@/lib/blockchain-utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Upload, Loader2, CheckCircle, XCircle, ImageIcon, Zap, ExternalLink } from "lucide-react"

interface NFTMintModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: (tokenId: string) => void
  artworkData?: {
    title: string
    description: string
    imageUrl: string
    dataset: string
    colorScheme: string
    seed: number
    rarity: string
  }
}

type MintStep = "form" | "uploading" | "minting" | "success" | "error"

export function NFTMintModal({ isOpen, onClose, onSuccess, artworkData }: NFTMintModalProps) {
  const [step, setStep] = useState<MintStep>("form")
  const [formData, setFormData] = useState({
    title: artworkData?.title || "",
    description: artworkData?.description || "",
    price: "0.1",
    royalty: "10",
    category: "Digital Art",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string>(artworkData?.imageUrl || "")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [ipfsHash, setIpfsHash] = useState<string>("")

  const { account, isConnected, mintNFT, chainId } = useWeb3()
  const { toast } = useToast()

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    }
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const validateForm = (): boolean => {
    if (!formData.title.trim()) {
      setError("Title is required")
      return false
    }
    if (!formData.description.trim()) {
      setError("Description is required")
      return false
    }
    if (!selectedFile && !artworkData?.imageUrl) {
      setError("Image is required")
      return false
    }
    if (Number.parseFloat(formData.price) <= 0) {
      setError("Price must be greater than 0")
      return false
    }
    return true
  }

  const handleMint = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFT",
        variant: "destructive",
      })
      return
    }

    if (!validateForm()) {
      setStep("error")
      return
    }

    setStep("uploading")
    setError("")

    try {
      let imageHash = ""

      // Upload image to IPFS
      if (selectedFile) {
        toast({
          title: "Uploading image",
          description: "Uploading your artwork to IPFS...",
        })
        imageHash = await uploadToIPFS(selectedFile)
      } else if (artworkData?.imageUrl) {
        // For generated artworks, we'll use a placeholder hash
        imageHash = "QmPlaceholderHashForGeneratedArt"
      }

      setIpfsHash(imageHash)

      // Create metadata
      const metadata = createNFTMetadata({
        title: formData.title,
        description: formData.description,
        artist: account,
        imageHash,
        attributes: [
          { trait_type: "Category", value: formData.category },
          { trait_type: "Royalty", value: `${formData.royalty}%` },
          { trait_type: "Price", value: `${formData.price} ETH` },
          ...(artworkData
            ? [
                { trait_type: "Dataset", value: artworkData.dataset },
                { trait_type: "Color Scheme", value: artworkData.colorScheme },
                { trait_type: "Seed", value: artworkData.seed.toString() },
                { trait_type: "Rarity", value: artworkData.rarity },
              ]
            : []),
        ],
      })

      // Upload metadata to IPFS
      toast({
        title: "Uploading metadata",
        description: "Creating NFT metadata...",
      })
      const metadataHash = await uploadMetadataToIPFS(metadata)
      const tokenURI = `ipfs://${metadataHash}`

      setStep("minting")

      // Mint NFT on blockchain
      toast({
        title: "Minting NFT",
        description: "Creating your NFT on the blockchain...",
      })
      const txHash = await mintNFT(tokenURI, formData.price)
      setTransactionHash(txHash)

      // Save to Supabase
      const { data: artwork, error: dbError } = await supabase
        .from("artworks")
        .insert({
          title: formData.title,
          description: formData.description,
          image_url: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
          image_ipfs_hash: imageHash,
          metadata_url: `https://gateway.pinata.cloud/ipfs/${metadataHash}`,
          metadata_ipfs_hash: metadataHash,
          artist_id: account, // In real app, map to artist ID
          price: Number.parseFloat(formData.price),
          currency: "ETH",
          status: "available",
          rarity: artworkData?.rarity || "Common",
          dataset: artworkData?.dataset || "custom",
          color_scheme: artworkData?.colorScheme || "default",
          seed: artworkData?.seed || 0,
          generation_mode: artworkData ? "ai" : "custom",
          blockchain: "ethereum",
          token_id: "pending", // Will be updated when we get the actual token ID
          contract_address: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
          minted_at: new Date().toISOString(),
          listed_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .select()
        .single()

      if (dbError) {
        console.error("Error saving to database:", dbError)
      }

      setStep("success")
      toast({
        title: "NFT minted successfully!",
        description: "Your artwork has been minted as an NFT",
      })

      // Auto-close after success
      setTimeout(() => {
        onSuccess(artwork?.id || "")
        onClose()
        resetModal()
      }, 3000)
    } catch (error: any) {
      console.error("Minting error:", error)
      setError(error.message || "Failed to mint NFT")
      setStep("error")
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    }
  }

  const resetModal = () => {
    setStep("form")
    setFormData({
      title: artworkData?.title || "",
      description: artworkData?.description || "",
      price: "0.1",
      royalty: "10",
      category: "Digital Art",
    })
    setSelectedFile(null)
    setPreviewUrl(artworkData?.imageUrl || "")
    setTransactionHash("")
    setError("")
    setIpfsHash("")
  }

  const handleClose = () => {
    if (step !== "uploading" && step !== "minting") {
      onClose()
      resetModal()
    }
  }

  const getExplorerUrl = (hash: string) => {
    const baseUrls: { [key: number]: string } = {
      1: "https://etherscan.io",
      11155111: "https://sepolia.etherscan.io",
      137: "https://polygonscan.com",
      80001: "https://mumbai.polygonscan.com",
    }
    const baseUrl = baseUrls[chainId || 1] || "https://etherscan.io"
    return `${baseUrl}/tx/${hash}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-400" />
            {step === "form" && "Mint NFT"}
            {step === "uploading" && "Uploading to IPFS"}
            {step === "minting" && "Minting NFT"}
            {step === "success" && "NFT Minted Successfully!"}
            {step === "error" && "Minting Failed"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "form" && "Create an NFT from your artwork"}
            {step === "uploading" && "Uploading your artwork and metadata to IPFS"}
            {step === "minting" && "Creating your NFT on the blockchain"}
            {step === "success" && "Your NFT has been successfully created"}
            {step === "error" && "There was an error minting your NFT"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {step === "form" && (
            <>
              {/* Image Upload/Preview */}
              <div className="space-y-3">
                <Label className="text-white">Artwork Image</Label>
                <div className="flex gap-4">
                  {previewUrl ? (
                    <div className="relative">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="w-32 h-32 object-cover rounded-lg border border-gray-700"
                      />
                      {!artworkData && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedFile(null)
                            setPreviewUrl("")
                          }}
                          className="absolute -top-2 -right-2 h-6 w-6 p-0 bg-red-600 hover:bg-red-700 border-red-600"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  ) : (
                    <div className="w-32 h-32 border-2 border-dashed border-gray-600 rounded-lg flex items-center justify-center">
                      <ImageIcon className="w-8 h-8 text-gray-500" />
                    </div>
                  )}

                  {!artworkData && (
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <Label
                        htmlFor="image-upload"
                        className="flex items-center justify-center h-32 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer hover:border-gray-500 transition-colors"
                      >
                        <div className="text-center">
                          <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                          <span className="text-sm text-gray-400">Click to upload image</span>
                        </div>
                      </Label>
                    </div>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-white">
                    Title *
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    placeholder="Enter artwork title"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category" className="text-white">
                    Category
                  </Label>
                  <Input
                    id="category"
                    value={formData.category}
                    onChange={(e) => handleInputChange("category", e.target.value)}
                    placeholder="Digital Art"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-white">
                  Description *
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  placeholder="Describe your artwork..."
                  rows={3}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price" className="text-white">
                    Price (ETH) *
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    min="0"
                    value={formData.price}
                    onChange={(e) => handleInputChange("price", e.target.value)}
                    placeholder="0.1"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="royalty" className="text-white">
                    Royalty (%)
                  </Label>
                  <Input
                    id="royalty"
                    type="number"
                    min="0"
                    max="50"
                    value={formData.royalty}
                    onChange={(e) => handleInputChange("royalty", e.target.value)}
                    placeholder="10"
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
              </div>

              {/* Artwork Attributes (if generated) */}
              {artworkData && (
                <div className="space-y-3">
                  <Label className="text-white">Artwork Attributes</Label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    <Badge variant="secondary" className="bg-blue-500/20 text-blue-300">
                      {artworkData.rarity}
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-500/20 text-purple-300">
                      {artworkData.dataset}
                    </Badge>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-300">
                      {artworkData.colorScheme}
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-500/20 text-orange-300">
                      Seed: {artworkData.seed}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Minting Info */}
              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Zap className="w-5 h-5 text-blue-400 mt-0.5" />
                  <div className="text-sm">
                    <p className="text-blue-400 font-medium mb-1">NFT Minting</p>
                    <p className="text-gray-300">
                      Your artwork will be uploaded to IPFS and minted as an NFT on the blockchain. This process
                      requires a transaction fee (gas).
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleMint}
                  disabled={!isConnected}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Zap className="w-4 h-4 mr-2" />
                  Mint NFT
                </Button>
              </div>
            </>
          )}

          {(step === "uploading" || step === "minting") && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">
                {step === "uploading" ? "Uploading to IPFS..." : "Minting NFT..."}
              </h3>
              <p className="text-gray-400 mb-4">
                {step === "uploading"
                  ? "Uploading your artwork and metadata to IPFS storage"
                  : "Creating your NFT on the blockchain. Please confirm the transaction in your wallet."}
              </p>
              {ipfsHash && (
                <div className="bg-gray-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">IPFS Hash</p>
                  <p className="font-mono text-sm text-green-400">{ipfsHash}</p>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">NFT Minted Successfully!</h3>
              <p className="text-gray-400 mb-4">
                Your artwork has been successfully minted as an NFT and is now available on the marketplace.
              </p>
              {transactionHash && (
                <div className="space-y-3">
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                    <p className="font-mono text-sm text-green-400 break-all">{transactionHash}</p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transactionHash), "_blank")}
                    className="border-gray-700 hover:bg-gray-800 bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Explorer
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Minting Failed</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  Close
                </Button>
                <Button onClick={() => setStep("form")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
