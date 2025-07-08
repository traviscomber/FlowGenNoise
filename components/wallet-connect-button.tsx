"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useWeb3 } from "@/lib/web3-context"
import { Wallet, Copy, ExternalLink, LogOut } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const getNetworkName = (chainId: number | null): string => {
  switch (chainId) {
    case 1:
      return "Ethereum"
    case 137:
      return "Polygon"
    case 11155111:
      return "Sepolia"
    case 80001:
      return "Mumbai"
    default:
      return "Unknown"
  }
}

const getNetworkColor = (chainId: number | null): string => {
  switch (chainId) {
    case 1:
      return "bg-blue-500"
    case 137:
      return "bg-purple-500"
    case 11155111:
      return "bg-yellow-500"
    case 80001:
      return "bg-orange-500"
    default:
      return "bg-gray-500"
  }
}

export const WalletConnectButton: React.FC = () => {
  const { account, balance, chainId, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWeb3()
  const { toast } = useToast()

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string | null): string => {
    if (!balance) return "0.00"
    const num = Number.parseFloat(balance)
    return num.toFixed(4)
  }

  const copyAddress = async () => {
    if (account) {
      await navigator.clipboard.writeText(account)
      toast({
        title: "Address copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const openEtherscan = () => {
    if (account && chainId) {
      const baseUrl =
        chainId === 1
          ? "https://etherscan.io"
          : chainId === 137
            ? "https://polygonscan.com"
            : chainId === 11155111
              ? "https://sepolia.etherscan.io"
              : "https://etherscan.io"

      window.open(`${baseUrl}/address/${account}`, "_blank")
    }
  }

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <div className="text-red-400 text-sm">{error}</div>
        <Button onClick={connectWallet} disabled={isConnecting} size="sm">
          {isConnecting ? "Connecting..." : "Retry"}
        </Button>
      </div>
    )
  }

  if (!isConnected) {
    return (
      <Button onClick={connectWallet} disabled={isConnecting} className="bg-blue-600 hover:bg-blue-700">
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <div className={`w-2 h-2 rounded-full ${getNetworkColor(chainId)}`} />
          <span className="hidden sm:inline">{formatAddress(account!)}</span>
          <span className="sm:hidden">
            <Wallet className="w-4 h-4" />
          </span>
          <Badge variant="secondary" className="hidden md:inline">
            {formatBalance(balance)} ETH
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="p-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Connected Wallet</span>
            <Badge variant="outline" className="text-xs">
              {getNetworkName(chainId)}
            </Badge>
          </div>
          <div className="text-xs text-gray-500 mb-1">Address</div>
          <div className="text-sm font-mono mb-3">{formatAddress(account!)}</div>
          <div className="text-xs text-gray-500 mb-1">Balance</div>
          <div className="text-sm font-medium mb-3">{formatBalance(balance)} ETH</div>
        </div>
        <DropdownMenuItem onClick={copyAddress}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openEtherscan}>
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={disconnectWallet} className="text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
