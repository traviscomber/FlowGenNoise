"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/lib/web3-context"
import { formatEthAmount, logTransactionToSupabase } from "@/lib/blockchain-utils"
import { supabase } from "@/lib/supabase"
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
  Zap,
} from "lucide-react"
import type { Artwork } from "@/lib/database"

interface PurchaseModalProps {
  artwork: Artwork | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type PurchaseStep = "confirm" | "processing" | "success" | "error"

export function PurchaseModal({ artwork, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const [step, setStep] = useState<PurchaseStep>("confirm")
  const [transactionHash, setTransactionHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const { account, balance, chainId, isConnected, purchaseNFT } = useWeb3()
  const { toast } = useToast()

  if (!artwork) return null

  const platformFee = artwork.price * 0.025 // 2.5%
  const artistRoyalty = artwork.price * 0.075 // 7.5%
  const totalPrice = artwork.price + platformFee + artistRoyalty
  const hasInsufficientFunds = Number.parseFloat(balance) < totalPrice

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
      // Purchase NFT on blockchain
      const txHash = await purchaseNFT(artwork.token_id || "1", totalPrice.toString())
      setTransactionHash(txHash)

      // Update artwork status in Supabase
      const { error: updateError } = await supabase
        .from("artworks")
        .update({
          status: "sold",
          owner_address: account,
          sold_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", artwork.id)

      if (updateError) {
        console.error("Error updating artwork:", updateError)
      }

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        artwork_id: artwork.id,
        seller_id: artwork.artist_id,
        buyer_id: account,
        price: totalPrice,
        currency: "ETH",
        status: "completed",
        tx_hash: txHash,
        platform_fee: platformFee,
        artist_royalty: artistRoyalty,
        completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
      })

      if (transactionError) {
        console.error("Error creating transaction:", transactionError)
      }

      // Update artist statistics
      if (artwork.artist) {
        const { error: artistError } = await supabase
          .from("artists")
          .update({
            total_sales: (artwork.artist.total_sales || 0) + totalPrice,
            updated_at: new Date().toISOString(),
          })
          .eq("id", artwork.artist_id)

        if (artistError) {
          console.error("Error updating artist stats:", artistError)
        }
      }

      // Log blockchain transaction
      await logTransactionToSupabase({
        txHash,
        fromAddress: account,
        toAddress: artwork.artist?.wallet_address || "",
        transactionType: "purchase",
        chainId: chainId!,
        value: totalPrice.toString(),
        tokenId: artwork.token_id,
        status: "completed",
      })

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
      11155111: "https://sepolia.etherscan.io",
      137: "https://polygonscan.com",
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
          <DialogTitle className="text-white flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            {step === "confirm" && "Complete Purchase"}
            {step === "processing" && "Processing Transaction"}
            {step === "success" && "Purchase Successful!"}
            {step === "error" && "Transaction Failed"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "confirm" && "Review your purchase details below"}
            {step === "processing" && "Please wait while we process your transaction"}
            {step === "success" && "Your NFT has been successfully purchased"}
            {step === "error" && "There was an error processing your transaction"}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Artwork Info */}
          <div className="flex space-x-4">
            <img
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              className="w-20 h-20 object-cover rounded-lg border border-gray-700"
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
                  <span className="font-semibold text-white">{formatEthAmount(artwork.price)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Platform Fee (2.5%)</span>
                  <span className="font-semibold text-white">{formatEthAmount(platformFee)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Artist Royalty (7.5%)</span>
                  <span className="font-semibold text-white">{formatEthAmount(artistRoyalty)} ETH</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">Total</span>
                  <span className="font-bold text-lg text-green-400">{formatEthAmount(totalPrice)} ETH</span>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="p-4 bg-gray-800/30 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Your Balance</span>
                  <span className="font-semibold text-white">{formatEthAmount(balance)} ETH</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">After Purchase</span>
                  <span
                    className={`font-semibold ${
                      Number.parseFloat(balance) - totalPrice >= 0 ? "text-green-400" : "text-red-400"
                    }`}
                  >
                    {formatEthAmount(Number.parseFloat(balance) - totalPrice)} ETH
                  </span>
                </div>
              </div>

              {hasInsufficientFunds && (
                <Alert className="bg-red-900/20 border-red-500/30">
                  <AlertTriangle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    Insufficient funds. You need {formatEthAmount(totalPrice - Number.parseFloat(balance))} more ETH.
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-3 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <Shield className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium mb-1">Secure Blockchain Transaction</p>
                  <p className="text-gray-300">
                    This NFT purchase is secured by blockchain technology. The artwork will be transferred to your
                    wallet upon confirmation.
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
                  <Zap className="w-4 h-4 mr-2" />
                  Purchase NFT
                </Button>
              </div>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <p className="text-gray-300 mb-2">Processing blockchain transaction...</p>
              <p className="text-sm text-gray-500">Please confirm the transaction in your wallet</p>
              {transactionHash && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg">
                  <p className="text-xs text-gray-400 mb-1">Transaction Hash</p>
                  <p className="font-mono text-xs text-green-400 break-all">{transactionHash}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(getExplorerUrl(transactionHash), "_blank")}
                    className="mt-2 border-gray-700 hover:bg-gray-800 bg-transparent"
                  >
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View Transaction
                  </Button>
                </div>
              )}
            </div>
          )}

          {step === "success" && (
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-4" />
              <p className="text-green-400 font-semibold mb-2">NFT Purchase Successful!</p>
              <p className="text-gray-300 mb-4">The NFT has been transferred to your wallet</p>
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
