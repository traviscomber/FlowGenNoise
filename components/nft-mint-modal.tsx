"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWeb3 } from "@/lib/web3-context"
import { uploadToIPFS, uploadMetadataToIPFS, createNFTMetadata } from "@/lib/blockchain-utils"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"
import { Palette, Upload, Loader2, CheckCircle, ExternalLink } from "lucide-react"

interface NFTMintModalProps {
  imageUrl: string
  defaultTitle?: string
  defaultDescription?: string
  onMintSuccess?: (txHash: string) => void
}

export function NFTMintModal({ imageUrl, defaultTitle, defaultDescription, onMintSuccess }: NFTMintModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState(defaultTitle || "")
  const [description, setDescription] = useState(defaultDescription || "")
  const [price, setPrice] = useState("0.01")
  const [royalty, setRoyalty] = useState("10")
  const [isMinting, setIsMinting] = useState(false)
  const [mintingStep, setMintingStep] = useState("")
  const [progress, setProgress] = useState(0)
  const [txHash, setTxHash] = useState("")

  const { isConnected, account, chainId, mintNFT } = useWeb3()
  const { toast } = useToast()

  const handleMint = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to mint NFTs",
        variant: "destructive",
      })
      return
    }

    if (!title.trim() || !description.trim()) {
      toast({
        title: "Missing information",
        description: "Please provide both title and description",
        variant: "destructive",
      })
      return
    }

    setIsMinting(true)
    setProgress(0)

    try {
      // Step 1: Convert image URL to File and upload to IPFS
      setMintingStep("Uploading image to IPFS...")
      setProgress(20)

      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const file = new File([blob], `${title.replace(/\s+/g, "-")}.png`, { type: "image/png" })

      const imageHash = await uploadToIPFS(file)
      setProgress(40)

      // Step 2: Create and upload metadata
      setMintingStep("Creating NFT metadata...")
      const metadata = createNFTMetadata({
        title,
        description,
        artist: account,
        imageHash,
        attributes: [
          { trait_type: "Creator", value: account },
          { trait_type: "Price", value: `${price} ETH` },
          { trait_type: "Royalty", value: `${royalty}%` },
          { trait_type: "Created With", value: "FlowSketch AI" },
          { trait_type: "Network", value: chainId?.toString() || "Unknown" },
        ],
      })

      const metadataHash = await uploadMetadataToIPFS(metadata)
      const tokenURI = `ipfs://${metadataHash}`
      setProgress(60)

      // Step 3: Mint NFT on blockchain
      setMintingStep("Minting NFT on blockchain...")
      const txHash = await mintNFT(tokenURI, price)
      setTxHash(txHash)
      setProgress(80)

      // Step 4: Save to Supabase
      setMintingStep("Saving to database...")
      const { error } = await supabase.from("artworks").insert({
        title,
        description,
        image_url: `ipfs://${imageHash}`,
        metadata_url: tokenURI,
        artist_id: account,
        price: Number.parseFloat(price),
        royalty_percentage: Number.parseFloat(royalty),
        blockchain_network: chainId?.toString(),
        transaction_hash: txHash,
        token_id: null, // Will be updated when we get the actual token ID
        is_minted: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

      if (error) {
        console.error("Error saving to database:", error)
        toast({
          title: "Database error",
          description: "NFT minted but failed to save to database",
          variant: "destructive",
        })
      }

      setProgress(100)
      setMintingStep("NFT minted successfully!")

      toast({
        title: "NFT Minted Successfully!",
        description: `Your NFT "${title}" has been minted on the blockchain`,
      })

      onMintSuccess?.(txHash)

      // Reset form
      setTimeout(() => {
        setIsOpen(false)
        setTitle("")
        setDescription("")
        setPrice("0.01")
        setRoyalty("10")
        setProgress(0)
        setMintingStep("")
        setTxHash("")
      }, 3000)
    } catch (error: any) {
      console.error("Minting error:", error)
      toast({
        title: "Minting failed",
        description: error.message || "Failed to mint NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMinting(false)
    }
  }

  const openTransaction = () => {
    if (txHash && chainId) {
      const networks = {
        1: "https://etherscan.io",
        11155111: "https://sepolia.etherscan.io",
        137: "https://polygonscan.com",
        80001: "https://mumbai.polygonscan.com",
      }
      const explorerUrl = networks[chainId as keyof typeof networks]
      if (explorerUrl) {
        window.open(`${explorerUrl}/tx/${txHash}`, "_blank")
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Palette className="w-4 h-4" />
          Mint as NFT
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5" />
            Mint NFT
          </DialogTitle>
          <DialogDescription>
            Create an NFT from your generated artwork and list it on the blockchain.
          </DialogDescription>
        </DialogHeader>

        {!isMinting ? (
          <div className="space-y-4">
            {/* Preview */}
            <div className="flex justify-center">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="NFT Preview"
                className="w-32 h-32 rounded-lg object-cover border"
              />
            </div>

            {/* Form */}
            <div className="space-y-3">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter NFT title"
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your artwork..."
                  className="mt-1 min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="price">Price (ETH)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.001"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="royalty">Royalty (%)</Label>
                  <Input
                    id="royalty"
                    type="number"
                    min="0"
                    max="50"
                    value={royalty}
                    onChange={(e) => setRoyalty(e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </div>

            {/* Wallet Status */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium">Wallet Status:</span>
              <Badge variant={isConnected ? "default" : "destructive"}>
                {isConnected ? "Connected" : "Not Connected"}
              </Badge>
            </div>

            {!isConnected && (
              <div className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                Please connect your wallet to mint NFTs
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Progress */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Minting Progress</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground">{mintingStep}</p>
            </div>

            {/* Success State */}
            {progress === 100 && txHash && (
              <div className="flex items-center justify-center p-4 bg-green-50 rounded-lg border border-green-200">
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm font-medium text-green-800">NFT Minted Successfully!</p>
                  <Button variant="outline" size="sm" onClick={openTransaction} className="mt-2 bg-transparent">
                    <ExternalLink className="w-4 h-4 mr-1" />
                    View Transaction
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          {!isMinting ? (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleMint} disabled={!isConnected || !title.trim() || !description.trim()}>
                <Upload className="w-4 h-4 mr-2" />
                Mint NFT
              </Button>
            </>
          ) : (
            <Button disabled className="w-full">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Minting...
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
