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
import { formatAddress, getNetworkName, SUPPORTED_NETWORKS } from "@/lib/blockchain-utils"
import { Wallet, ChevronDown, Copy, ExternalLink, Power, Network } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/* -------------------------------------------------------------------------- */
/*                     Wallet Connect Button Component                        */
/* -------------------------------------------------------------------------- */

export function WalletConnectButton() {
  const { hasProvider, isConnected, account, chainId, balance, connect, disconnect, switchNetwork, isLoading } =
    useWeb3()
  const { toast } = useToast()
  const [isNetworkMenuOpen, setIsNetworkMenuOpen] = useState(false)

  /* ---------------- copy / explorer helpers ---------------- */

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
      const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
      if (network) {
        window.open(`${network.blockExplorer}/address/${account}`, "_blank")
      }
    }
  }

  /* ---------------- network switching ---------------- */

  const handleNetworkSwitch = async (targetChainId: number) => {
    try {
      await switchNetwork(targetChainId)
      setIsNetworkMenuOpen(false)
      toast({
        title: "Network switched",
        description: `Switched to ${getNetworkName(targetChainId)}`,
      })
    } catch (error) {
      toast({
        title: "Network switch failed",
        description: "Failed to switch network. Please try again.",
        variant: "destructive",
      })
    }
  }

  /* ---------------- UI paths ---------------- */

  /* 1. No provider – prompt install */
  if (!hasProvider) {
    return (
      <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer">
        <Button variant="outline" className="gap-2 bg-transparent">
          <ExternalLink size={16} />
          {"Install MetaMask"}
        </Button>
      </a>
    )
  }

  /* 2. Not connected yet */
  if (!isConnected) {
    return (
      <Button onClick={connect} disabled={isLoading} className="flex gap-2">
        <Wallet className="w-4 h-4" />
        {isLoading ? "Connecting…" : "Connect Wallet"}
      </Button>
    )
  }

  /* 3. Connected – show menus */
  return (
    <div className="flex items-center gap-2">
      {/* Network Selector */}
      <DropdownMenu open={isNetworkMenuOpen} onOpenChange={setIsNetworkMenuOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
            <Network className="w-3 h-3" />
            <span className="hidden sm:inline">{chainId ? getNetworkName(chainId) : "Unknown"}</span>
            <ChevronDown className="w-3 h-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {Object.entries(SUPPORTED_NETWORKS).map(([id, network]) => (
            <DropdownMenuItem
              key={id}
              onClick={() => handleNetworkSwitch(Number(id))}
              className="flex items-center justify-between"
            >
              <span>{network.name}</span>
              {chainId === Number(id) && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  Current
                </Badge>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Wallet Menu */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2 bg-transparent">
            <Wallet className="w-4 h-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{formatAddress(account || "")}</span>
              {balance && (
                <span className="text-xs text-muted-foreground">
                  {Number.parseFloat(balance).toFixed(4)}{" "}
                  {chainId && SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.currency}
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <div className="px-2 py-1.5">
            <p className="text-sm font-medium">Connected Wallet</p>
            <p className="text-xs text-muted-foreground">{account}</p>
          </div>
          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={copyAddress} className="flex gap-2">
            <Copy className="w-4 h-4" />
            Copy Address
          </DropdownMenuItem>

          <DropdownMenuItem onClick={openEtherscan} className="flex gap-2">
            <ExternalLink className="w-4 h-4" />
            View on Explorer
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          <DropdownMenuItem onClick={disconnect} className="flex items-center gap-2 text-red-600 focus:text-red-600">
            <Power className="w-4 h-4" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

/* Named *and* default export for compatibility */
export default WalletConnectButton
