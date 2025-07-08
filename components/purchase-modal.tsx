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
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useWeb3 } from "@/lib/web3-context"
import { formatEthAmount } from "@/lib/blockchain-utils"
import { useToast } from "@/hooks/use-toast"
import { ShoppingCart, Wallet, AlertTriangle, ExternalLink, CheckCircle, Loader2 } from "lucide-react"

interface PurchaseModalProps {
  artwork: {
    id: string
    title: string
    artist: string
    price: number
    image_url: string
    description?: string
  }
  onPurchaseSuccess?: (txHash: string) => void
}

export function PurchaseModal({ artwork, onPurchaseSuccess }: PurchaseModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [txHash, setTxHash] = useState("")

  const { isConnected, account, balance, chainId, purchaseNFT } = useWeb3()
  const { toast } = useToast()

  const platformFee = artwork.price * 0.025 // 2.5% platform fee
  const artistRoyalty = artwork.price * 0.1 // 10% artist royalty
  const totalCost = artwork.price + platformFee + artistRoyalty
  const estimatedGas = 0.002 // Estimated gas cost in ETH

  const hasEnoughBalance = Number.parseFloat(balance) >= totalCost + estimatedGas

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase NFTs",
        variant: "destructive",
      })
      return
    }

    if (!hasEnoughBalance) {
      toast({
        title: "Insufficient balance",
        description: "You don't have enough ETH to complete this purchase",
        variant: "destructive",
      })
      return
    }

    setIsPurchasing(true)

    try {
      // Purchase NFT on blockchain
      const txHash = await purchaseNFT(artwork.id, artwork.price.toString())
      setTxHash(txHash)

      // Update artwork ownership in Supabase via API
      const response = await fetch("/api/purchase-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          buyerAddress: account,
          transactionHash: txHash,
          price: artwork.price,
          chainId,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update ownership records")
      }

      toast({
        title: "Purchase successful!",
        description: `You now own "${artwork.title}"`,
      })

      onPurchaseSuccess?.(txHash)

      // Close modal after success
      setTimeout(() => {
        setIsOpen(false)
        setTxHash("")
      }, 3000)
    } catch (error: any) {
      console.error("Purchase error:", error)
      toast({
        title: "Purchase failed",
        description: error.message || "Failed to purchase NFT. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsPurchasing(false)
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
          <ShoppingCart className="w-4 h-4" />
          Purchase
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" />
            Purchase NFT
          </DialogTitle>
          <DialogDescription>Complete your purchase of this digital artwork NFT.</DialogDescription>
        </DialogHeader>

        {!isPurchasing && !txHash ? (
          <div className="space-y-4">
            {/* Artwork Preview */}
            <div className="flex gap-3">
              <img
                src={artwork.image_url || "/placeholder.svg"}
                alt={artwork.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-sm">{artwork.title}</h3>
                <p className="text-sm text-muted-foreground">by {artwork.artist}</p>
                <Badge variant="secondary" className="mt-1">
                  {formatEthAmount(artwork.price)} ETH
                </Badge>
              </div>
            </div>

            <Separator />

            {/* Cost Breakdown */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Cost Breakdown</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Artwork Price</span>
                  <span>{formatEthAmount(artwork.price)} ETH</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Platform Fee (2.5%)</span>
                  <span>{formatEthAmount(platformFee)} ETH</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Artist Royalty (10%)</span>
                  <span>{formatEthAmount(artistRoyalty)} ETH</span>
                </div>
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>Total Cost</span>
                  <span>{formatEthAmount(totalCost)} ETH</span>
                </div>
                <div className="flex justify-between text-muted-foreground text-xs">
                  <span>Est. Gas Fee</span>
                  <span>~{formatEthAmount(estimatedGas)} ETH</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Wallet Status */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Wallet Status:</span>
                <Badge variant={isConnected ? "default" : "destructive"}>
                  {isConnected ? "Connected" : "Not Connected"}
                </Badge>
              </div>
              {isConnected && (
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Your Balance:</span>
                  <span className="text-sm">{formatEthAmount(balance)} ETH</span>
                </div>
              )}
            </div>

            {/* Warnings */}
            {!isConnected && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                <Wallet className="w-4 h-4 text-amber-600 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <p className="font-medium">Wallet Required</p>
                  <p>Please connect your wallet to purchase this NFT.</p>
                </div>
              </div>
            )}

            {isConnected && !hasEnoughBalance && (
              <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5" />
                <div className="text-sm text-red-800">
                  <p className="font-medium">Insufficient Balance</p>
                  <p>
                    You need at least {formatEthAmount(totalCost + estimatedGas)} ETH to complete this purchase
                    (including gas fees).
                  </p>
                </div>
              </div>
            )}

            {/* Security Notice */}
            <div className="text-xs text-muted-foreground bg-gray-50 p-3 rounded-lg">
              <p className="font-medium mb-1">🔒 Secure Transaction</p>
              <p>
                This purchase will be processed on the blockchain. Make sure you trust this transaction before
                proceeding.
              </p>
            </div>
          </div>
        ) : isPurchasing ? (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
                <p className="font-medium">Processing Purchase...</p>
                <p className="text-sm text-muted-foreground mt-1">Please confirm the transaction in your wallet</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-center p-8">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-4" />
                <p className="font-medium text-green-800">Purchase Successful!</p>
                <p className="text-sm text-muted-foreground mt-1">You now own this NFT</p>
                <Button variant="outline" size="sm" onClick={openTransaction} className="mt-3 bg-transparent">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Transaction
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          {!isPurchasing && !txHash ? (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handlePurchase} disabled={!isConnected || !hasEnoughBalance}>
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase for {formatEthAmount(totalCost)} ETH
              </Button>
            </>
          ) : isPurchasing ? (
            <Button disabled className="w-full">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing...
            </Button>
          ) : (
            <Button onClick={() => setIsOpen(false)} className="w-full">
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
