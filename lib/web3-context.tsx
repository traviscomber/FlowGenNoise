"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { ethers } from "ethers"
import { mintNFT as mintNFTUtil, purchaseNFT as purchaseNFTUtil, SUPPORTED_NETWORKS } from "./blockchain-utils"

interface Web3ContextType {
  // Connection state
  hasProvider: boolean
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string | null

  // Connection methods
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>

  // Transaction methods
  mintNFT: (tokenURI: string, price: string) => Promise<string>
  purchaseNFT: (tokenId: string, price: string) => Promise<string>

  // State
  isLoading: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [hasProvider, setHasProvider] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Check if wallet is available and already connected
  useEffect(() => {
    const checkProvider = () => {
      const hasMetaMask =
        typeof window !== "undefined" && !!(window as any).ethereum && (window as any).ethereum.isMetaMask
      setHasProvider(hasMetaMask)
      return hasMetaMask
    }

    if (checkProvider()) {
      checkConnection()

      // Listen for account changes
      const { ethereum } = window as any
      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)
      ethereum.on("disconnect", handleDisconnect)

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
        ethereum.removeListener("chainChanged", handleChainChanged)
        ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [])

  const checkConnection = async () => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const address = await signer.getAddress()
          const network = await provider.getNetwork()
          const balance = await provider.getBalance(address)

          setAccount(address)
          setChainId(Number(network.chainId))
          setBalance(ethers.formatEther(balance))
          setIsConnected(true)
        }
      }
    } catch (error) {
      console.error("Error checking connection:", error)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  const handleChainChanged = (chainId: string) => {
    setChainId(Number.parseInt(chainId, 16))
    if (account) {
      updateBalance(account)
    }
  }

  const handleDisconnect = () => {
    disconnect()
  }

  const updateBalance = async (address: string) => {
    try {
      if (typeof window !== "undefined" && (window as any).ethereum) {
        const provider = new ethers.BrowserProvider((window as any).ethereum)
        const balance = await provider.getBalance(address)
        setBalance(ethers.formatEther(balance))
      }
    } catch (error) {
      console.error("Error updating balance:", error)
    }
  }

  const connect = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      if (!hasProvider) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      // Request account access
      await (window as any).ethereum.request({ method: "eth_requestAccounts" })

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      setAccount(address)
      setChainId(Number(network.chainId))
      setBalance(ethers.formatEther(balance))
      setIsConnected(true)

      console.log("Connected to wallet:", address)
    } catch (error: any) {
      console.error("Connection error:", error)
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsLoading(false)
    }
  }, [hasProvider])

  const disconnect = () => {
    setIsConnected(false)
    setAccount(null)
    setChainId(null)
    setBalance(null)
    setError(null)
    console.log("Wallet disconnected")
  }

  const switchNetwork = async (targetChainId: number) => {
    try {
      setIsLoading(true)
      setError(null)

      if (!hasProvider) {
        throw new Error("MetaMask is not installed")
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`

      try {
        // Try to switch to the network
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError: any) {
        // If the network doesn't exist, add it
        if (switchError.code === 4902) {
          const networkConfig = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]
          if (networkConfig) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName: networkConfig.name,
                  rpcUrls: [networkConfig.rpcUrl],
                  blockExplorerUrls: [networkConfig.blockExplorer],
                  nativeCurrency: {
                    name: networkConfig.currency,
                    symbol: networkConfig.currency,
                    decimals: 18,
                  },
                },
              ],
            })
          }
        } else {
          throw switchError
        }
      }

      setChainId(targetChainId)
      if (account) {
        updateBalance(account)
      }
    } catch (error: any) {
      console.error("Network switch error:", error)
      setError(error.message || "Failed to switch network")
    } finally {
      setIsLoading(false)
    }
  }

  const mintNFT = async (tokenURI: string, price: string): Promise<string> => {
    if (!isConnected || !chainId) {
      throw new Error("Wallet not connected")
    }

    setIsLoading(true)
    setError(null)

    try {
      const txHash = await mintNFTUtil(tokenURI, price, chainId)

      // Update balance after transaction
      if (account) {
        setTimeout(() => updateBalance(account), 2000)
      }

      return txHash
    } catch (error: any) {
      setError(error.message || "Failed to mint NFT")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseNFT = async (tokenId: string, price: string): Promise<string> => {
    if (!isConnected || !chainId) {
      throw new Error("Wallet not connected")
    }

    setIsLoading(true)
    setError(null)

    try {
      const txHash = await purchaseNFTUtil(tokenId, price, chainId)

      // Update balance after transaction
      if (account) {
        setTimeout(() => updateBalance(account), 2000)
      }

      return txHash
    } catch (error: any) {
      setError(error.message || "Failed to purchase NFT")
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value: Web3ContextType = {
    hasProvider,
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    mintNFT,
    purchaseNFT,
    isLoading,
    error,
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

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>
      on: (event: string, callback: (...args: any[]) => void) => void
      removeListener: (event: string, callback: (...args: any[]) => void) => void
      isMetaMask?: boolean
    }
  }
}
