"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface Web3ContextType {
  account: string | null
  isConnected: boolean
  isLoading: boolean
  hasProvider: boolean
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: string) => Promise<void>
  getBalance: () => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasProvider, setHasProvider] = useState(false)

  useEffect(() => {
    // Check if MetaMask is installed
    const checkProvider = () => {
      if (typeof window !== "undefined" && window.ethereum) {
        setHasProvider(true)

        // Check if already connected
        window.ethereum
          .request({ method: "eth_accounts" })
          .then((accounts: string[]) => {
            if (accounts.length > 0) {
              setAccount(accounts[0])
              setIsConnected(true)
            }
          })
          .catch(console.error)
      } else {
        setHasProvider(false)
      }
    }

    checkProvider()

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)
        } else {
          setAccount(null)
          setIsConnected(false)
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const connect = async () => {
    if (!hasProvider) {
      throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
    }

    setIsLoading(true)
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)
      }
    } catch (error) {
      console.error("Failed to connect wallet:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setIsConnected(false)
  }

  const switchNetwork = async (chainId: string) => {
    if (!hasProvider) {
      throw new Error("MetaMask is not installed")
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId }],
      })
    } catch (error) {
      console.error("Failed to switch network:", error)
      throw error
    }
  }

  const getBalance = async (): Promise<string> => {
    if (!hasProvider || !account) {
      return "0"
    }

    try {
      const balance = await window.ethereum.request({
        method: "eth_getBalance",
        params: [account, "latest"],
      })

      // Convert from wei to ETH
      const ethBalance = Number.parseInt(balance, 16) / Math.pow(10, 18)
      return ethBalance.toFixed(4)
    } catch (error) {
      console.error("Failed to get balance:", error)
      return "0"
    }
  }

  const value: Web3ContextType = {
    account,
    isConnected,
    isLoading,
    hasProvider,
    connect,
    disconnect,
    switchNetwork,
    getBalance,
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
