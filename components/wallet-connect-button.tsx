"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Wallet, ChevronDown, Copy, ExternalLink, LogOut, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { useToast } from "@/hooks/use-toast"

export function WalletConnectButton() {
  const { account, balance, chainId, isConnecting, isConnected, connectWallet, disconnectWallet, error } = useWeb3()
  const { toast } = useToast()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
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

  const getChainName = (chainId: number) => {
    const chains: { [key: number]: string } = {
      1: "Ethereum",
      5: "Goerli",
      137: "Polygon",
      80001: "Mumbai",
      11155111: "Sepolia",
    }
    return chains[chainId] || `Chain ${chainId}`
  }

  const getChainColor = (chainId: number) => {
    const colors: { [key: number]: string } = {
      1: "bg-blue-500",
      5: "bg-yellow-500",
      137: "bg-purple-500",
      80001: "bg-orange-500",
      11155111: "bg-green-500",
    }
    return colors[chainId] || "bg-gray-500"
  }

  if (error) {
    return (
      <Card className="bg-red-900/20 border-red-500/30">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2 text-red-400">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">{error}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!isConnected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={isConnecting}
        className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
      >
        <Wallet className="w-4 h-4 mr-2" />
        {isConnecting ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="bg-gray-900/50 border-gray-700 hover:bg-gray-800">
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${getChainColor(chainId!)}`} />
            <Wallet className="w-4 h-4" />
            <span>{formatAddress(account!)}</span>
            <ChevronDown className="w-4 h-4" />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64 bg-gray-900 border-gray-700" align="end">
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Connected Account</span>
            <Badge className={`${getChainColor(chainId!)} text-white text-xs`}>{getChainName(chainId!)}</Badge>
          </div>

          <div className="font-mono text-sm mb-2">{formatAddress(account!)}</div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Balance</span>
            <span className="font-semibold">{formatBalance(balance)} ETH</span>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-800 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
          className="hover:bg-gray-800 cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem onClick={disconnectWallet} className="hover:bg-gray-800 cursor-pointer text-red-400">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
