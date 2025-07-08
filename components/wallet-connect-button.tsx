"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useWeb3 } from "@/lib/web3-context"
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle, ChevronDown } from "lucide-react"
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

const getExplorerUrl = (address: string, chainId: number | null): string => {
  switch (chainId) {
    case 1:
      return `https://etherscan.io/address/${address}`
    case 137:
      return `https://polygonscan.com/address/${address}`
    case 11155111:
      return `https://sepolia.etherscan.io/address/${address}`
    case 80001:
      return `https://mumbai.polygonscan.com/address/${address}`
    default:
      return `https://etherscan.io/address/${address}`
  }
}

export const WalletConnectButton: React.FC = () => {
  const { account, balance, chainId, isConnected, isConnecting, error, connectWallet, disconnectWallet } = useWeb3()
  const { toast } = useToast()

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string | null): string => {
    if (!balance) return "0.0000"
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

  const openExplorer = () => {
    if (account) {
      window.open(getExplorerUrl(account, chainId), "_blank")
    }
  }

  if (error && !isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        variant="outline"
        className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
      >
        <AlertCircle className="w-4 h-4 mr-2" />
        Install MetaMask
      </Button>
    )
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-900/50 border-gray-700 hover:bg-gray-800 backdrop-blur-sm"
        >
          <div className={`w-2 h-2 rounded-full ${getNetworkColor(chainId)}`} />
          <span className="hidden sm:inline font-mono text-sm">{formatAddress(account!)}</span>
          <span className="sm:hidden">
            <Wallet className="w-4 h-4" />
          </span>
          <Badge variant="secondary" className="hidden md:inline bg-green-500/20 text-green-400 border-green-500/30">
            {formatBalance(balance)} ETH
          </Badge>
          <ChevronDown className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700 backdrop-blur-sm">
        <div className="p-3 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Connected Account</span>
            <Badge variant="secondary" className={`${getNetworkColor(chainId)} text-white border-0 text-xs`}>
              {getNetworkName(chainId)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="text-xs text-gray-400">Wallet Address</div>
            <div className="font-mono text-sm bg-gray-800 p-2 rounded text-gray-200">{formatAddress(account!)}</div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="font-semibold text-green-400">
              {formatBalance(balance)} {chainId === 137 || chainId === 80001 ? "MATIC" : "ETH"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-800 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplorer} className="hover:bg-gray-800 cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          onClick={disconnectWallet}
          className="hover:bg-gray-800 cursor-pointer text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
