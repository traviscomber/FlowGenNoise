"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/hooks/use-toast"

interface Web3ContextType {
  isConnected: boolean
  account: string | null
  balance: string
  chainId: number | null
  isLoading: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

const SUPPORTED_CHAINS = {
  1: { name: "Ethereum", symbol: "ETH", rpc: "https://mainnet.infura.io/v3/" },
  137: { name: "Polygon", symbol: "MATIC", rpc: "https://polygon-rpc.com/" },
  11155111: { name: "Sepolia", symbol: "ETH", rpc: "https://sepolia.infura.io/v3/" },
  80001: { name: "Mumbai", symbol: "MATIC", rpc: "https://rpc-mumbai.maticvigil.com/" },
}

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const getBalance = useCallback(async (address: string) => {
    if (!window.ethereum) return "0"

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [address, "latest"],
      })

      // Convert from wei to ETH
      const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)
      return balanceInEth.toFixed(4)
    } catch (error) {
      console.error("Error getting balance:", error)
      return "0"
    }
  }, [])

  const connectWallet = useCallback(async () => {
    if (!window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension to connect your wallet.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const account = accounts[0]
        setAccount(account)
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({
          method: "eth_chainId",
        })
        setChainId(Number.parseInt(chainId, 16))

        // Get balance
        const balance = await getBalance(account)
        setBalance(balance)

        toast({
          title: "Wallet connected",
          description: `Connected to ${account.slice(0, 6)}...${account.slice(-4)}`,
        })
      }
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet")
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect to MetaMask",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [getBalance, toast])

  const disconnectWallet = useCallback(() => {
    setIsConnected(false)
    setAccount(null)
    setBalance("0")
    setChainId(null)
    setError(null)

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
  }, [toast])

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!window.ethereum) return

      try {
        await window.ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Chain not added to MetaMask
          const chain = SUPPORTED_CHAINS[targetChainId as keyof typeof SUPPORTED_CHAINS]
          if (chain) {
            try {
              await window.ethereum.request({
                method: "wallet_addEthereumChain",
                params: [
                  {
                    chainId: `0x${targetChainId.toString(16)}`,
                    chainName: chain.name,
                    nativeCurrency: {
                      name: chain.symbol,
                      symbol: chain.symbol,
                      decimals: 18,
                    },
                    rpcUrls: [chain.rpc],
                  },
                ],
              })
            } catch (addError) {
              console.error("Error adding chain:", addError)
              toast({
                title: "Network error",
                description: "Failed to add network to MetaMask",
                variant: "destructive",
              })
            }
          }
        } else {
          console.error("Error switching network:", error)
          toast({
            title: "Network switch failed",
            description: error.message || "Failed to switch network",
            variant: "destructive",
          })
        }
      }
    },
    [toast],
  )

  // Listen for account changes
  useEffect(() => {
    if (!window.ethereum) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        getBalance(accounts[0]).then(setBalance)
      }
    }

    const handleChainChanged = (chainId: string) => {
      setChainId(Number.parseInt(chainId, 16))
      // Refresh balance when chain changes
      if (account) {
        getBalance(account).then(setBalance)
      }
    }

    window.ethereum.on("accountsChanged", handleAccountsChanged)
    window.ethereum.on("chainChanged", handleChainChanged)

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [account, disconnectWallet, getBalance])

  // Check if already connected on mount
  useEffect(() => {
    const checkConnection = async () => {
      if (!window.ethereum) return

      try {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        })

        if (accounts.length > 0) {
          const account = accounts[0]
          setAccount(account)
          setIsConnected(true)

          const chainId = await window.ethereum.request({
            method: "eth_chainId",
          })
          setChainId(Number.parseInt(chainId, 16))

          const balance = await getBalance(account)
          setBalance(balance)
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }

    checkConnection()
  }, [getBalance])

  const value: Web3ContextType = {
    isConnected,
    account,
    balance,
    chainId,
    isLoading,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
