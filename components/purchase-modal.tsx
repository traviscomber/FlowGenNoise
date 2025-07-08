"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/lib/web3-context"
import { useToast } from "@/hooks/use-toast"
import {
  ShoppingCart,
  Loader2,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Shield,
  Verified,
} from "lucide-react"
import type { Artwork } from "@/lib/database"

interface PurchaseModalProps {
  artwork: Artwork | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type PurchaseStep = "confirm" | "processing" | "success" | "error"

export const PurchaseModal: React.FC<PurchaseModalProps> = ({ artwork, isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState<PurchaseStep>("confirm")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { account, balance, chainId, isConnected } = useWeb3()
  const { toast } = useToast()

  if (!artwork) return null

  const platformFee = artwork.price * 0.025 // 2.5%
  const artistRoyalty = artwork.price * 0.075 // 7.5%
  const totalPrice = artwork.price + platformFee + artistRoyalty
  const hasInsufficientFunds = Number.parseFloat(balance || "0") < totalPrice

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to make a purchase.",
        variant: "destructive",
      })
      return
    }

    if (hasInsufficientFunds) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough ETH to complete this purchase.",
        variant: "destructive",
      })
      return
    }

    setStep("processing")
    setError("")

    try {
      // Simulate blockchain transaction
      const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`
      setTransactionHash(mockTxHash)

      // Simulate transaction delay
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Call API to update artwork status in Supabase
      const response = await fetch("/api/purchase-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId: artwork.id,
          buyerAddress: account,
          transactionHash: mockTxHash,
          price: totalPrice,
          chainId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to process purchase")
      }

      setStep("success")
      toast({
        title: "Purchase successful!",
        description: `You now own "${artwork.title}"`,
      })

      // Auto-close after success
      setTimeout(() => {
        onSuccess()
        onClose()
        resetModal()
      }, 3000)
    } catch (error: any) {
      console.error("Purchase error:", error)
      setError(error.message || "Transaction failed")
      setStep("error")
      toast({
        title: "Purchase failed",
        description: error.message || "Transaction could not be completed",
        variant: "destructive",
      })
    }
  }

  const resetModal = () => {
    setStep("confirm")
    setTransactionHash("")
    setError("")
  }

  const handleClose = () => {
    if (step !== "processing") {
      onClose()
      resetModal()
    }
  }

  const getExplorerUrl = (hash: string) => {
    const baseUrls: { [key: number]: string } = {
      1: "https://etherscan.io",
      137: "https://polygonscan.com",
      11155111: "https://sepolia.etherscan.io",
      80001: "https://mumbai.polygonscan.com",
    }
    const baseUrl = baseUrls[chainId || 1] || "https://etherscan.io"
    return `${baseUrl}/tx/${hash}`
  }

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      Common: "bg-gray-500",
      Rare: "bg-blue-500",
      Epic: "bg-purple-500",
      Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
    }
    return colors[rarity] || "bg-gray-500"
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="bg-gray-900 border-gray-700 max-w-md">
        <DialogHeader>
          <DialogTitle className="text-white">
            {step === "confirm" && "Complete Purchase"}
            {step === "processing" && "Processing Transaction"}
            {step === "success" && "Purchase Successful!"}
            {step === "error" && "Transaction Failed"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "confirm" && "Review your purchase details below"}
            {step === "processing" && "Please wait while we process your transaction"}
            {step === "success" && "Your artwork has been successfully purchased"}
            {step === "error" && "There was an error processing your transaction"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Info */}
          <div className="flex space-x-4">
            <img
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{artwork.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{artwork.artist?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400">{artwork.artist?.username}</span>
                {artwork.artist?.verified && <Verified className="w-3 h-3 text-blue-400" />}
              </div>
              <Badge className={`mt-2 ${getRarityColor(artwork.rarity)} text-white border-0 text-xs`}>
                {artwork.rarity}
              </Badge>
            </div>
          </div>

          {step === "confirm" && (
            <>
              {/* Price Breakdown */}
              <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Artwork Price</span>
                  <span className="font-semibold text-white">{artwork.price} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fee (2.5%)</span>
                  <span className="font-semibold text-white">{platformFee.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Artist Royalty (7.5%)</span>
                  <span className="font-semibold text-white">{artistRoyalty.toFixed(4)} ETH</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-lg text-green-400">{totalPrice.toFixed(4)} ETH</span>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Your Balance</span>
                  <span className="font-semibold text-white">{Number.parseFloat(balance || "0").toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">After Purchase</span>
                  <span
                    className={`font-semibold ${
                      Number.parseFloat(balance || "0") - totalPrice >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {(Number.parseFloat(balance || "0") - totalPrice).toFixed(4)} ETH
                  </span>
                </div>
              </div>

              {hasInsufficientFunds && (
                <Alert className="bg-red-900/20 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    Insufficient funds. You need {(totalPrice - Number.parseFloat(balance || "0")).toFixed(4)} more ETH.
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Secure Transaction</p>
                  <p className="text-gray-300">
                    This transaction will transfer the NFT to your wallet. All transactions are secured by blockchain
                    technology.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handlePurchase}
                  disabled={hasInsufficientFunds || !isConnected}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Purchase Now
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Processing your transaction...</p>
              <p className="text-sm text-gray-500">This may take a few moments</p>
              {transactionHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl(transactionHash), "_blank")}
                  className="mt-4 border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </Button>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-400 font-semibold mb-2">Transaction Successful!</p>
              <p className="text-gray-300 mb-4">The artwork has been transferred to your wallet</p>
              {transactionHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(getExplorerUrl(transactionHash), "_blank")}
                  className="border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Transaction
                </Button>
              )}
            </div>
          )}

          {step === "error" && (
            <div className="text-center py-8">
              <XCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <p className="text-red-400 font-semibold mb-2">Transaction Failed</p>
              <p className="text-gray-300 mb-4">{error}</p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  Close
                </Button>
                <Button onClick={() => setStep("confirm")} className="flex-1 bg-blue-600 hover:bg-blue-700">
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
