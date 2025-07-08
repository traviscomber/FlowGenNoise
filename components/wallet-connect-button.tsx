"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useWeb3 } from "@/lib/web3-context"
import { NETWORK_CONFIG } from "@/lib/blockchain-utils"
import { Wallet, Copy, ExternalLink, LogOut, AlertCircle, ChevronDown, Settings, History, Zap } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WalletConnectButton() {
  const {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  } = useWeb3()
  const { toast } = useToast()
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string): string => {
    const num = Number.parseFloat(balance)
    return num.toFixed(4)
  }

  const getNetworkInfo = (chainId: number | null) => {
    if (!chainId) return { name: "Unknown", symbol: "ETH", color: "bg-gray-500" }

    const network = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]
    const colors: { [key: number]: string } = {
      1: "bg-blue-500",
      11155111: "bg-yellow-500",
      137: "bg-purple-500",
      80001: "bg-orange-500",
    }

    return {
      name: network?.name || "Unknown",
      symbol: network?.symbol || "ETH",
      color: colors[chainId] || "bg-gray-500",
    }
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
    if (account && chainId) {
      const network = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]
      if (network) {
        window.open(`${network.explorerUrl}/address/${account}`, "_blank")
      }
    }
  }

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      await switchNetwork(targetChainId)
      setIsDropdownOpen(false)
    } catch (error) {
      console.error("Failed to switch network:", error)
    }
  }

  // Show error state
  if (error && !isConnected) {
    return (
      <div className="flex items-center gap-2">
        <Button
          onClick={connectWallet}
          disabled={isConnecting}
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 bg-transparent"
        >
          <AlertCircle className="w-4 h-4 mr-2" />
          {error.includes("MetaMask") ? "Install MetaMask" : "Retry Connection"}
        </Button>
      </div>
    )
  }

  // Show connect button
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

  const networkInfo = getNetworkInfo(chainId)

  return (
    <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 bg-gray-900/50 border-gray-700 hover:bg-gray-800 backdrop-blur-sm min-w-[200px]"
        >
          <div className={`w-2 h-2 rounded-full ${networkInfo.color}`} />
          <Avatar className="w-6 h-6">
            <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} />
            <AvatarFallback className="text-xs">{account?.slice(2, 4).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start">
            <span className="font-mono text-sm">{formatAddress(account!)}</span>
            <span className="text-xs text-gray-400">
              {formatBalance(balance)} {networkInfo.symbol}
            </span>
          </div>
          <ChevronDown className="w-4 h-4 ml-auto" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 bg-gray-900 border-gray-700 backdrop-blur-sm">
        {/* Account Info */}
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">Connected Account</span>
            <Badge variant="secondary" className={`${networkInfo.color} text-white border-0 text-xs`}>
              {networkInfo.name}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            <Avatar className="w-10 h-10">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} />
              <AvatarFallback>{account?.slice(2, 4).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="font-mono text-sm text-gray-200">{formatAddress(account!)}</div>
              <div className="text-xs text-gray-400">
                {formatBalance(balance)} {networkInfo.symbol}
              </div>
            </div>
          </div>

          <div className="bg-gray-800 p-3 rounded-lg">
            <div className="text-xs text-gray-400 mb-1">Full Address</div>
            <div className="font-mono text-xs text-gray-200 break-all">{account}</div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Network Switching */}
        <div className="p-2">
          <div className="text-xs text-gray-400 px-2 py-1 mb-1">Switch Network</div>
          {Object.entries(NETWORK_CONFIG).map(([id, network]) => {
            const chainIdNum = Number.parseInt(id)
            const isActive = chainId === chainIdNum
            const colors: { [key: number]: string } = {
              1: "bg-blue-500",
              11155111: "bg-yellow-500",
              137: "bg-purple-500",
              80001: "bg-orange-500",
            }

            return (
              <DropdownMenuItem
                key={id}
                onClick={() => !isActive && handleNetworkSwitch(chainIdNum)}
                className={`hover:bg-gray-800 cursor-pointer ${isActive ? "bg-gray-800" : ""}`}
                disabled={isActive}
              >
                <div className={`w-2 h-2 rounded-full ${colors[chainIdNum]} mr-3`} />
                <span className={isActive ? "text-white" : "text-gray-300"}>{network.name}</span>
                {isActive && <Zap className="w-3 h-3 ml-auto text-green-400" />}
              </DropdownMenuItem>
            )
          })}
        </div>

        <DropdownMenuSeparator className="bg-gray-700" />

        {/* Actions */}
        <DropdownMenuItem onClick={copyAddress} className="hover:bg-gray-800 cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>

        <DropdownMenuItem onClick={openExplorer} className="hover:bg-gray-800 cursor-pointer">
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Explorer
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
          <History className="w-4 h-4 mr-2" />
          Transaction History
        </DropdownMenuItem>

        <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
          <Settings className="w-4 h-4 mr-2" />
          Wallet Settings
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-gray-700" />

        <DropdownMenuItem
          onClick={disconnectWallet}
          className="hover:bg-gray-800 cursor-pointer text-red-400 hover:text-red-300"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect Wallet
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
