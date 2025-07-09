"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Wallet, ExternalLink, Copy, LogOut, AlertCircle } from "lucide-react"
import { useWeb3 } from "@/lib/web3-context"
import { toast } from "@/hooks/use-toast"

export function WalletConnectButton() {
  const { account, isConnected, isLoading, hasProvider, connect, disconnect, getBalance } = useWeb3()
  const [balance, setBalance] = useState<string>("0")

  const handleConnect = async () => {
    try {
      await connect()
      const userBalance = await getBalance()
      setBalance(userBalance)
      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      })
    } catch (error: any) {
      toast({
        title: "Connection Failed",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setBalance("0")
    toast({
      title: "Wallet Disconnected",
      description: "Successfully disconnected from MetaMask",
    })
  }

  const copyAddress = () => {
    if (account) {
      navigator.clipboard.writeText(account)
      toast({
        title: "Address Copied",
        description: "Wallet address copied to clipboard",
      })
    }
  }

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Show install MetaMask button if no provider
  if (!hasProvider) {
    return (
      <Button
        variant="outline"
        onClick={() => window.open("https://metamask.io/download/", "_blank")}
        className="flex items-center gap-2"
      >
        <AlertCircle className="w-4 h-4" />
        Install MetaMask
        <ExternalLink className="w-3 h-3" />
      </Button>
    )
  }

  // Show connect button if not connected
  if (!isConnected) {
    return (
      <Button onClick={handleConnect} disabled={isLoading} className="flex items-center gap-2">
        <Wallet className="w-4 h-4" />
        {isLoading ? "Connecting..." : "Connect Wallet"}
      </Button>
    )
  }

  // Show connected wallet dropdown
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">{shortenAddress(account!)}</span>
          <Badge variant="secondary" className="ml-2">
            {balance} ETH
          </Badge>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium">Connected Wallet</p>
          <p className="text-xs text-gray-500 font-mono">{account}</p>
        </div>
        <div className="px-3 py-2 border-b">
          <p className="text-sm">Balance: {balance} ETH</p>
        </div>
        <DropdownMenuItem onClick={copyAddress} className="cursor-pointer">
          <Copy className="w-4 h-4 mr-2" />
          Copy Address
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => window.open(`https://etherscan.io/address/${account}`, "_blank")}
          className="cursor-pointer"
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          View on Etherscan
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDisconnect} className="cursor-pointer text-red-600">
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default WalletConnectButton
