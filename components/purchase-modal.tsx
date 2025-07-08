"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Wallet, CreditCard, Shield, CheckCircle, AlertCircle, ExternalLink, Loader2 } from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useToast } from "@/hooks/use-toast"
import { ethers } from "ethers"
import type { Artwork } from "@/lib/database"

interface PurchaseModalProps {
  artwork: Artwork | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

type PurchaseStep = "confirm" | "processing" | "success" | "error"

export function PurchaseModal({ artwork, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  const { account, signer, balance, chainId } = useWeb3()
  const { toast } = useToast()
  const [step, setStep] = useState<PurchaseStep>("confirm")
  const [txHash, setTxHash] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)

  if (!artwork) return null

  const platformFee = artwork.price * 0.025 // 2.5% platform fee
  const artistRoyalty = artwork.price * 0.075 // 7.5% artist royalty
  const totalCost = artwork.price + platformFee + artistRoyalty
  const hasInsufficientFunds = Number.parseFloat(balance) < totalCost

  const handlePurchase = async () => {
    if (!signer || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to continue",
        variant: "destructive",
      })
      return
    }

    if (hasInsufficientFunds) {
      toast({
        title: "Insufficient funds",
        description: "You don't have enough ETH to complete this purchase",
        variant: "destructive",
      })
      return
    }

    try {
      setIsProcessing(true)
      setStep("processing")
      setError("")

      // Simulate smart contract interaction
      // In a real implementation, you would interact with your NFT marketplace contract
      const tx = await signer.sendTransaction({
        to: artwork.artist?.wallet_address || "0x0000000000000000000000000000000000000000",
        value: ethers.parseEther(totalCost.toString()),
        gasLimit: 21000,
      })

      setTxHash(tx.hash)

      // Wait for transaction confirmation
      const receipt = await tx.wait()

      if (receipt?.status === 1) {
        // Update artwork status in database
        await updateArtworkStatus(artwork.id, "sold", account)

        setStep("success")
        toast({
          title: "Purchase successful!",
          description: `You've successfully purchased "${artwork.title}"`,
        })

        // Call success callback after a delay
        setTimeout(() => {
          onSuccess()
          onClose()
          resetModal()
        }, 3000)
      } else {
        throw new Error("Transaction failed")
      }
    } catch (error: any) {
      console.error("Purchase error:", error)
      setError(error.message || "Transaction failed")
      setStep("error")
      toast({
        title: "Purchase failed",
        description: error.message || "Transaction failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  const updateArtworkStatus = async (artworkId: string, status: string, buyerAddress: string) => {
    try {
      const response = await fetch("/api/purchase-artwork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          artworkId,
          status,
          buyerAddress,
          txHash,
          price: totalCost,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update artwork status")
      }
    } catch (error) {
      console.error("Error updating artwork status:", error)
    }
  }

  const resetModal = () => {
    setStep("confirm")
    setTxHash("")
    setError("")
    setIsProcessing(false)
  }

  const handleClose = () => {
    if (step !== "processing") {
      onClose()
      resetModal()
    }
  }

  const getRarityColor = (rarity: string) => {
    const colors = {
      Common: "bg-gray-500",
      Rare: "bg-blue-500",
      Epic: "bg-purple-500",
      Legendary: "bg-gradient-to-r from-yellow-400 to-orange-500",
    }
    return colors[rarity as keyof typeof colors] || "bg-gray-500"
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
        </DialogHeader>

        <div className="space-y-4">
          {/* Artwork Info */}
          <div className="flex items-center space-x-3 p-3 bg-gray-800/50 rounded-lg">
            <img
              src={artwork.image_url || "/placeholder.svg"}
              alt={artwork.title}
              className="w-16 h-16 rounded-lg object-cover"
            />
            <div className="flex-1">
              <h3 className="font-semibold text-white">{artwork.title}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">{artwork.artist?.username?.[0]?.toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="text-sm text-gray-400">{artwork.artist?.username}</span>
              </div>
            </div>
            <Badge className={`${getRarityColor(artwork.rarity)} text-white`}>{artwork.rarity}</Badge>
          </div>

          {step === "confirm" && (
            <>
              {/* Price Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Artwork Price</span>
                  <span className="text-white">{artwork.price} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Platform Fee (2.5%)</span>
                  <span className="text-white">{platformFee.toFixed(4)} ETH</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Artist Royalty (7.5%)</span>
                  <span className="text-white">{artistRoyalty.toFixed(4)} ETH</span>
                </div>
                <Separator className="bg-gray-700" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total</span>
                  <span className="text-white">{totalCost.toFixed(4)} ETH</span>
                </div>
              </div>

              {/* Wallet Info */}
              <div className="p-3 bg-gray-800/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Wallet className="w-4 h-4 text-blue-400" />
                    <span className="text-sm text-gray-400">Your Balance</span>
                  </div>
                  <span className={`font-semibold ${hasInsufficientFunds ? "text-red-400" : "text-white"}`}>
                    {Number.parseFloat(balance).toFixed(4)} ETH
                  </span>
                </div>
              </div>

              {hasInsufficientFunds && (
                <Alert className="bg-red-900/20 border-red-500/30">
                  <AlertCircle className="h-4 w-4 text-red-400" />
                  <AlertDescription className="text-red-400">
                    Insufficient funds. You need {(totalCost - Number.parseFloat(balance)).toFixed(4)} more ETH.
                  </AlertDescription>
                </Alert>
              )}

              {/* Security Notice */}
              <div className="flex items-start space-x-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <Shield className="w-4 h-4 text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="text-blue-400 font-medium">Secure Transaction</p>
                  <p className="text-gray-400">
                    This purchase is secured by blockchain technology and cannot be reversed.
                  </p>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={hasInsufficientFunds || isProcessing}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                {isProcessing ? "Processing..." : "Complete Purchase"}
              </Button>
            </>
          )}

          {step === "processing" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin text-blue-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Processing Transaction</h3>
              <p className="text-gray-400 mb-4">
                Please confirm the transaction in your wallet and wait for blockchain confirmation.
              </p>
              {txHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, "_blank")}
                  className="border-gray-700 hover:bg-gray-800 bg-transparent"
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
              <h3 className="text-lg font-semibold text-white mb-2">Purchase Successful!</h3>
              <p className="text-gray-400 mb-4">
                Congratulations! You now own "{artwork.title}". The NFT has been transferred to your wallet.
              </p>
              {txHash && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(`https://etherscan.io/tx/${txHash}`, "_blank")}
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
              <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">Transaction Failed</h3>
              <p className="text-gray-400 mb-4">{error}</p>
              <div className="space-y-2">
                <Button
                  onClick={handlePurchase}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  Try Again
                </Button>
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full border-gray-700 hover:bg-gray-800 bg-transparent"
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
