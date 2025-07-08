"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useWeb3 } from "@/lib/web3-context"
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

const CHAIN_NAMES = {
  1: "Ethereum",
  137: "Polygon",
  11155111: "Sepolia",
  80001: "Mumbai",
}

const CHAIN_COLORS = {
  1: "bg-blue-500",
  137: "bg-purple-500",
  11155111: "bg-yellow-500",
  80001: "bg-green-500",
}

export function WalletConnectButton() {
  const { isConnected, account, balance, chainId, isLoading, error, connectWallet, disconnectWallet } = useWeb3()
  const { toast } = useToast()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

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
      const baseUrls = {
        1: "https://etherscan.io",
        137: "https://polygonscan.com",
        11155111: "https://sepolia.etherscan.io",
        80001: "https://mumbai.polygonscan.com",
      }

      const baseUrl = baseUrls[chainId as keyof typeof baseUrls] || "https://etherscan.io"
      window.open(`${baseUrl}/address/${account}`, "_blank")
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const getChainName = (chainId: number) => {
    return CHAIN_NAMES[chainId as keyof typeof CHAIN_NAMES] || `Chain ${chainId}`
  }

  const getChainColor = (chainId: number) => {
    return CHAIN_COLORS[chainId as keyof typeof CHAIN_COLORS] || "bg-gray-500"
  }

  if (error && !isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isLoading}
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
        disabled={isLoading}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-gray-700 hover:bg-gray-800 bg-gray-900/50 backdrop-blur-sm">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${chainId ? getChainColor(chainId) : "bg-gray-500"}`} />
            <span className="font-mono text-sm">{account ? formatAddress(account) : "Unknown"}</span>
            <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30">
              {balance} ETH
            </Badge>
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-64 bg-gray-900 border-gray-700 backdrop-blur-sm">
        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Wallet Address</span>
            <Button variant="ghost" size="sm" onClick={copyAddress} className="h-6 w-6 p-0 hover:bg-gray-800">
              <Copy className="w-3 h-3" />
            </Button>
          </div>
          <div className="font-mono text-xs bg-gray-800 p-2 rounded">{account}</div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <div className="p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Network</span>
            <Badge
              variant="secondary"
              className={`${chainId ? getChainColor(chainId) : "bg-gray-500"} text-white border-0`}
            >
              {chainId ? getChainName(chainId) : "Unknown"}
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="text-sm font-semibold text-green-400">
              {balance} {chainId === 137 || chainId === 80001 ? "MATIC" : "ETH"}
            </span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem onClick={openEtherscan} className="hover:bg-gray-800 cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-800 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
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
