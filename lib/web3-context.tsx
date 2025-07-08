"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ethers } from "ethers"

interface Web3ContextType {
  account: string | null
  balance: string | null
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>
  provider: ethers.BrowserProvider | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export const useWeb3 = () => {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider: React.FC<Web3ProviderProps> = ({ children }) => {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          setProvider(provider)
          setAccount(accounts[0])
          setIsConnected(true)

          const network = await provider.getNetwork()
          setChainId(Number(network.chainId))

          const balance = await provider.getBalance(accounts[0])
          setBalance(ethers.formatEther(balance))
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        const provider = new ethers.BrowserProvider(window.ethereum)
        setProvider(provider)
        setAccount(accounts[0])
        setIsConnected(true)

        const network = await provider.getNetwork()
        setChainId(Number(network.chainId))

        const balance = await provider.getBalance(accounts[0])
        setBalance(ethers.formatEther(balance))
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError("Please connect to MetaMask.")
      } else {
        setError("An error occurred while connecting to MetaMask.")
      }
      console.error("Error connecting wallet:", error)
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnectWallet = () => {
    setAccount(null)
    setBalance(null)
    setChainId(null)
    setIsConnected(false)
    setProvider(null)
    setError(null)
  }

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        setError("Please add this network to MetaMask first.")
      } else {
        setError("Failed to switch network.")
      }
      console.error("Error switching network:", error)
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected()

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
          checkIfWalletIsConnected()
        }
      }

      const handleChainChanged = (chainId: string) => {
        setChainId(Number.parseInt(chainId, 16))
        checkIfWalletIsConnected()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)

      return () => {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
        window.ethereum.removeListener("chainChanged", handleChainChanged)
      }
    }
  }, [])

  const value: Web3ContextType = {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    provider,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

declare global {
  interface Window {
    ethereum?: any
  }
}
