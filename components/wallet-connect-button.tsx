"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Card, CardContent } from "@/components/ui/card"
import { useWeb3 } from "@/lib/web3-context"
import { NETWORK_CONFIG } from "@/lib/blockchain-utils"
import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  Settings,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function WalletConnectButton() {
  const {
    isConnected,
    account,
    chainId,
    balance,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    clearError,
  } = useWeb3()

  const { toast } = useToast()
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false)

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
      setIsNetworkMenuOpen(false)
      toast({
        title: "Network switched",
        description: `Switched to ${NETWORK_CONFIG[targetChainId as keyof typeof NETWORK_CONFIG]?.name}`,
      })
    } catch (error) {
      toast({
        title: "Network switch failed",
        description: "Failed to switch network. Please try again.",
        variant: "destructive",
      })
    }
  }

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  const formatBalance = (balance: string) => {
    const num = Number.parseFloat(balance)
    return num.toFixed(4)
  }

  const getNetworkName = (chainId: number) => {
    return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.name || "Unknown Network"
  }

  const getNetworkSymbol = (chainId: number) => {
    return NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]?.symbol || "ETH"
  }

  const isNetworkSupported = (chainId: number) => {
    return chainId in NETWORK_CONFIG
  }

  if (!isConnected) {
    return (
      <div className="flex flex-col items-center gap-2">
        <Button onClick={connectWallet} disabled={isConnecting} className="flex items-center gap-2">
          {isConnecting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          ) : (
            <>
              <Wallet className="w-4 h-4" />
              Connect Wallet
            </>
          )}
        </Button>

        {error && (
          <Card className="w-full max-w-sm">
            <CardContent className="p-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-red-700 font-medium">Connection Error</p>
                  <p className="text-xs text-red-600 mt-1">{error}</p>
                  <Button variant="outline" size="sm" onClick={clearError} className="mt-2 h-7 text-xs bg-transparent">
                    Dismiss
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2">
      {/* Network Badge */}
      {chainId && (
        <DropdownMenu open={isNetworkMenuOpen} onOpenChange={setIsNetworkMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
              <div className={`w-2 h-2 rounded-full ${isNetworkSupported(chainId) ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs">{getNetworkSymbol(chainId)}</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel>Switch Network</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(NETWORK_CONFIG).map(([id, network]) => (
              <DropdownMenuItem
                key={id}
                onClick={() => handleNetworkSwitch(Number(id))}
                className="flex items-center justify-between"
              >
                <span>{network.name}</span>
                {chainId === Number(id) && <CheckCircle className="w-4 h-4 text-green-500" />}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {/* Wallet Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 px-3 bg-transparent">
            <Avatar className="w-6 h-6">
              <AvatarImage src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`} />
              <AvatarFallback className="text-xs">{account ? account.slice(2, 4).toUpperCase() : "??"}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{account ? formatAddress(account) : "Unknown"}</span>
              <span className="text-xs text-muted-foreground">
                {formatBalance(balance)} {chainId ? getNetworkSymbol(chainId) : "ETH"}
              </span>
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>Wallet Connected</span>
              <span className="text-xs font-normal text-muted-foreground">
                {chainId ? getNetworkName(chainId) : "Unknown Network"}
              </span>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />

          {/* Account Info */}
          <div className="px-2 py-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Address:</span>
              <Badge variant="secondary" className="text-xs">
                {account ? formatAddress(account) : "Unknown"}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Balance:</span>
              <span className="text-sm">
                {formatBalance(balance)} {chainId ? getNetworkSymbol(chainId) : "ETH"}
              </span>
            </div>
          </div>

          <DropdownMenuSeparator />

          {/* Actions */}
          <DropdownMenuItem onClick={copyAddress} className="flex items-center gap-2">
            <Copy className="w-4 h-4" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openExplorer} className="flex items-center gap-2">
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </DropdownMenuItem>

          <DropdownMenuItem className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={disconnectWallet} className="flex items-center gap-2 text-red-600">
            <LogOut className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Network Warning */}
      {chainId && !isNetworkSupported(chainId) && (
        <Badge variant="destructive" className="text-xs">
          Unsupported Network
        </Badge>
      )}
    </div>
  )
}
