"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWeb3 } from "@/lib/web3-context"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import { ExternalLink, Shield, Zap } from "lucide-react"

interface Artwork {
  id: string
  title: string
  artist_name: string
  price: number
  image_url: string
  rarity: string
}

interface PurchaseModalProps {
  artwork: Artwork | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ artwork, isOpen, onClose, onSuccess }) => {
  const { account, provider, isConnected } = useWeb3()
  const { toast } = useToast()
  const [isProcessing, setIsProcessing] = useState(false)
  const [transactionHash, setTransactionHash] = useState<string | null>(null)

  if (!artwork) return null

  const platformFee = artwork.price * 0.025 // 2.5%
  const artistRoyalty = artwork.price * 0.075 // 7.5%
  const totalPrice = artwork.price + platformFee + artistRoyalty

  const handlePurchase = async () => {
    if (!isConnected || !provider || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase.",
        variant: "destructive",
      })
      return
    }

    setIsProcessing(true)

    try {
      // Simulate smart contract interaction
      const signer = await provider.getSigner()

      // Create a transaction to simulate NFT purchase
      const transaction = {
        to: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Marketplace contract
        value: ethers.parseEther(totalPrice.toString()),
        gasLimit: 100000,
      }

      // Send transaction
      const tx = await signer.sendTransaction(transaction)
      setTransactionHash(tx.hash)

      toast({
        title: "Transaction submitted",
        description: "Your purchase is being processed on the blockchain.",
      })

      // Wait for confirmation
      const receipt = await tx.wait()

      if (receipt?.status === 1) {
        // Update database
        const response = await fetch("/api/purchase-artwork", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            artworkId: artwork.id,
            buyerAddress: account,
            transactionHash: tx.hash,
            price: totalPrice,
          }),
        })

        if (response.ok) {
          toast({
            title: "Purchase successful!",
            description: `You now own "${artwork.title}" by ${artwork.artist_name}`,
          })
          onSuccess()
          onClose()
        } else {
          throw new Error("Failed to update database")
        }
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Purchase error:", error)

      if (error.code === 4001) {
        toast({
          title: "Transaction cancelled",
          description: "You cancelled the transaction.",
          variant: "destructive",
        })
      } else if (error.code === "INSUFFICIENT_FUNDS") {
        toast({
          title: "Insufficient funds",
          description: "You do not have enough ETH to complete this purchase.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Purchase failed",
          description: error.message || "An error occurred during the purchase.",
          variant: "destructive",
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case "legendary":
        return "bg-yellow-500"
      case "epic":
        return "bg-purple-500"
      case "rare":
        return "bg-blue-500"
      case "uncommon":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Purchase Artwork</DialogTitle>
          <DialogDescription>Complete your purchase of this unique digital artwork</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Artwork Preview */}
          <div className="flex items-center gap-3">
            <img
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold">{artwork.title}</h3>
              <p className="text-sm text-gray-500">by {artwork.artist_name}</p>
              <Badge className={`${getRarityColor(artwork.rarity)} text-white text-xs mt-1`}>{artwork.rarity}</Badge>
            </div>
          </div>

          <Separator />

          {/* Price Breakdown */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Artwork Price</span>
              <span>{artwork.price} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Platform Fee (2.5%)</span>
              <span>{platformFee.toFixed(4)} ETH</span>
            </div>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Artist Royalty (7.5%)</span>
              <span>{artistRoyalty.toFixed(4)} ETH</span>
            </div>
            <Separator />
            <div className="flex justify-between font-semibold">
              <span>Total</span>
              <span>{totalPrice.toFixed(4)} ETH</span>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-sm">
              <Shield className="w-4 h-4" />
              <span className="font-medium">Secure Transaction</span>
            </div>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This purchase is secured by blockchain technology and cannot be reversed.
            </p>
          </div>

          {/* Transaction Status */}
          {transactionHash && (
            <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-green-600 dark:text-green-400 text-sm">
                <Zap className="w-4 h-4" />
                <span className="font-medium">Transaction Submitted</span>
              </div>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-green-600 dark:text-green-400">
                  Hash: {transactionHash.slice(0, 10)}...
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-green-600 dark:text-green-400"
                  onClick={() => window.open(`https://etherscan.io/tx/${transactionHash}`, "_blank")}
                >
                  <ExternalLink className="w-3 h-3" />
                </Button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" onClick={onClose} disabled={isProcessing} className="flex-1 bg-transparent">
              Cancel
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={isProcessing || !isConnected}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isProcessing ? "Processing..." : `Buy for ${totalPrice.toFixed(4)} ETH`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
