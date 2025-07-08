"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useWeb3 } from "@/lib/web3-context"
import { supabase } from "@/lib/supabase"
import { formatEthAmount, logTransactionToSupabase, formatAddress } from "@/lib/blockchain-utils"
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
  Eye,
  Heart,
} from "lucide-react"
import type { Artwork } from "@/lib/database"

interface PurchaseModalProps {
  artwork: Artwork | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Purchase modal for buying an NFT.
 * The component is safely guarded so that it renders **nothing**
 * until the parent passes a valid `artwork` object.
 */
export function PurchaseModal({ artwork, isOpen, onClose, onSuccess }: PurchaseModalProps) {
  /* ---------- STATE ---------- */
  const [step, setStep] = useState<"confirm" | "processing" | "success" | "error">("confirm")
  const [transactionHash, setTransactionHash] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  /* ---------- EXTERNAL HOOKS ---------- */
  const { toast } = useToast()
  const { account, balance, chainId, isConnected, purchaseNFT } = useWeb3()

  /* ---------- EARLY EXIT ---------- */
  // React hooks must always run, so this guard is placed *after* them.
  if (!artwork) return null

  /* ---------- PRICE CALCULATIONS ---------- */
  const platformFee = artwork.price * 0.025 // 2.5 %
  const artistRoyalty = artwork.price * 0.075 // 7.5 %
  const totalPrice = artwork.price + platformFee + artistRoyalty

  const hasInsufficientFunds = Number.parseFloat(balance) < totalPrice

  /* ---------- HELPERS ---------- */
  const getExplorerUrl = (hash: string) => {
    const explorers: Record<number, string> = {
      1: "https://etherscan.io",
      11155111: "https://sepolia.etherscan.io",
      137: "https://polygonscan.com",
      80001: "https://mumbai.polygonscan.com",
    }
    return `${explorers[chainId || 1] ?? explorers[1]}/tx/${hash}`
  }

  const handlePurchase = async () => {
    if (!isConnected || !account) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet to purchase this NFT.",
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

    try {
      setStep("processing")

      /* ---- 1️⃣  Send blockchain TX ---- */
      const txHash = await purchaseNFT(artwork.token_id ?? "0", totalPrice.toString())
      setTransactionHash(txHash)

      /* ---- 2️⃣  Update DB: artworks ---- */
      const { error: updateError } = await supabase
        .from("artworks")
        .update({
          status: "sold",
          owner_address: account,
          sold_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq("id", artwork.id)

      if (updateError) console.error("supabase:updateArtwork", updateError)

      /* ---- 3️⃣  Insert DB: transactions ---- */
      const { error: txError } = await supabase.from("transactions").insert({
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

      if (txError) console.error("supabase:insertTx", txError)

      /* ---- 4️⃣  Log TX via helper ---- */
      await logTransactionToSupabase({
        txHash,
        fromAddress: account,
        toAddress: artwork.artist?.wallet_address ?? "",
        transactionType: "purchase",
        chainId: chainId!,
        value: totalPrice.toString(),
        tokenId: artwork.token_id,
        status: "completed",
      })

      toast({
        title: "Purchase successful!",
        description: `You now own “${artwork.title}”`,
      })

      setStep("success")

      // Let parent refresh its data
      onSuccess()
      // Auto-close a little later
      setTimeout(() => {
        onClose()
        resetModal()
      }, 3000)
    } catch (err: any) {
      console.error("purchaseNFT", err)
      setErrorMessage(err?.message ?? "Transaction failed")
      setStep("error")
      toast({
        title: "Purchase failed",
        description: err?.message ?? "The transaction could not be completed.",
        variant: "destructive",
      })
    }
  }

  const resetModal = () => {
    setStep("confirm")
    setTransactionHash("")
    setErrorMessage("")
  }

  /* ---------- RENDER ---------- */
  return (
    <Dialog open={isOpen} onOpenChange={() => (step !== "processing" ? onClose() : undefined)}>
      <DialogContent className="max-w-md bg-gray-900 border-gray-700">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <ShoppingCart className="w-5 h-5 text-blue-400" />
            {step === "confirm" && "Complete Purchase"}
            {step === "processing" && "Processing Transaction"}
            {step === "success" && "Purchase Successful"}
            {step === "error" && "Transaction Failed"}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            {step === "confirm" && "Review and confirm your purchase details below."}
            {step === "processing" && "Please confirm the transaction in your wallet."}
            {step === "success" && "Your NFT has been transferred to your wallet."}
            {step === "error" && "There was an error processing your transaction."}
          </DialogDescription>
        </DialogHeader>

        {/* ---------- CONFIRM STEP ---------- */}
        {step === "confirm" && (
          <div className="space-y-6">
            {/* Artwork preview */}
            <div className="flex gap-4">
              <img
                src={artwork.image_url || "/placeholder.svg"}
                alt={artwork.title}
                className="w-20 h-20 rounded-lg object-cover border border-gray-700"
              />
              <div className="flex-1">
                <h3 className="font-semibold text-white">{artwork.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                  <Avatar className="w-5 h-5">
                    <AvatarImage src={artwork.artist?.avatar_url || "/placeholder.svg"} />
                    <AvatarFallback className="text-xs">{artwork.artist?.username?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span>{artwork.artist?.username}</span>
                  {artwork.artist?.verified && <Verified className="w-4 h-4 text-blue-400" />}
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  <Eye className="w-3 h-3" /> {artwork.views}
                  <Heart className="w-3 h-3" /> {artwork.likes}
                </div>
              </div>
            </div>

            {/* Price breakdown */}
            <div className="space-y-3 p-4 bg-gray-800/50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Artwork Price</span>
                <span className="text-white font-medium">{formatEthAmount(artwork.price)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Platform Fee (2.5%)</span>
                <span className="text-white font-medium">{formatEthAmount(platformFee)} ETH</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Artist Royalty (7.5%)</span>
                <span className="text-white font-medium">{formatEthAmount(artistRoyalty)} ETH</span>
              </div>
              <Separator className="bg-gray-700" />
              <div className="flex justify-between text-base font-semibold">
                <span className="text-white">Total</span>
                <span className="text-green-400">{formatEthAmount(totalPrice)} ETH</span>
              </div>
            </div>

            {/* Wallet summary */}
            <div className="p-4 bg-gray-800/30 rounded-lg text-sm">
              <div className="flex justify-between mb-1">
                <span className="text-gray-400">Connected Wallet</span>
                <span className="text-white">{formatAddress(account)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Balance</span>
                <span className={hasInsufficientFunds ? "text-red-400 font-medium" : "text-white font-medium"}>
                  {formatEthAmount(balance)} ETH
                </span>
              </div>
            </div>

            {/* Insufficient funds warning */}
            {hasInsufficientFunds && (
              <Alert className="bg-red-900/20 border-red-600/40">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                <AlertDescription className="text-red-300">
                  You need {formatEthAmount(totalPrice - Number.parseFloat(balance))} ETH more to complete this
                  purchase.
                </AlertDescription>
              </Alert>
            )}

            {/* Security notice */}
            <div className="flex items-start gap-3 p-4 bg-blue-900/20 border border-blue-600/40 rounded-lg text-sm">
              <Shield className="w-5 h-5 text-blue-400 mt-0.5" />
              <p className="text-gray-300">
                This transaction will be processed on the blockchain. Double-check the details in your wallet before
                confirming.
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-gray-700 hover:bg-gray-800 bg-transparent"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                onClick={handlePurchase}
                disabled={hasInsufficientFunds || !isConnected}
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Purchase NFT
              </Button>
            </div>
          </div>
        )}

        {/* ---------- PROCESSING STEP ---------- */}
        {step === "processing" && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 animate-spin text-blue-400 mx-auto mb-4" />
            <p className="text-gray-300">Processing your transaction…</p>
            {transactionHash && <p className="mt-2 text-xs text-gray-500 break-all">{transactionHash}</p>}
          </div>
        )}

        {/* ---------- SUCCESS STEP ---------- */}
        {step === "success" && (
          <div className="text-center py-10 space-y-4">
            <CheckCircle className="w-12 h-12 text-green-400 mx-auto" />
            <p className="font-semibold text-green-400">NFT Purchase Successful!</p>
            {transactionHash && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(getExplorerUrl(transactionHash), "_blank")}
                className="bg-transparent border-gray-700 hover:bg-gray-800"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                View Transaction
              </Button>
            )}
          </div>
        )}

        {/* ---------- ERROR STEP ---------- */}
        {step === "error" && (
          <div className="text-center py-10 space-y-4">
            <XCircle className="w-12 h-12 text-red-400 mx-auto" />
            <p className="font-semibold text-red-400">Transaction Failed</p>
            <p className="text-gray-400 text-sm">{errorMessage}</p>
            <div className="flex gap-3 mt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 bg-transparent border-gray-700 hover:bg-gray-800"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  setStep("confirm")
                  setErrorMessage("")
                }}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
