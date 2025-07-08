"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/lib/web3-context"
import { getNetworkName, SUPPORTED_NETWORKS } from "@/lib/blockchain-utils"
import { ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function WalletConnectButton() {
  const { hasProvider, isConnected, account, chainId, balance, connect, disconnect, switchNetwork, isLoading } =
    useWeb3()
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

  const openEtherscan = () => {
    if (account && chainId) {
      const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
      if (network) {
        window.open(`${network.blockExplorer}/address/${account}`, "_blank")
      }
    }
  }

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

  if (!hasProvider) {
    /* MetaMask not installed → offer link */
    return (
      <a href="https://metamask.io/download.html" target="_blank" rel="noopener noreferrer" className="inline-flex">
        <Button variant="outline" className="gap-2 bg-transparent">
          <ExternalLink size={16} />
          {"Install MetaMask"}
        </Button>
      </a>
    )
  }

  if (isConnected) {
    return (
      <Button variant="outline" onClick={disconnect} disabled={isLoading}>
        {`Disconnect (${account?.slice(0, 6)}…${account?.slice(-4)})`}
      </Button>
    )
  }

  return (
    <Button onClick={connect} disabled={isLoading}>
      {isLoading ? "Connecting…" : "Connect Wallet"}
    </Button>
  )
}
