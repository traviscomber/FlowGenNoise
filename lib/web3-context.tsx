"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

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
  const { toast } = useToast()

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const accounts = await window.ethereum.request({ method: "eth_accounts" })
        if (accounts.length > 0) {
          setAccount(accounts[0])
          setIsConnected(true)

          // Get chain ID
          const chainId = await window.ethereum.request({ method: "eth_chainId" })
          setChainId(Number.parseInt(chainId, 16))

          // Get balance
          const balance = await window.ethereum.request({
            method: "eth_getBalance",
            params: [accounts[0], "latest"],
          })
          const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)
          setBalance(balanceInEth.toFixed(4))

          // Update user in Supabase
          await updateUserInSupabase(accounts[0])
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error)
    }
  }

  const updateUserInSupabase = async (walletAddress: string) => {
    try {
      // Check if user exists
      const { data: existingUser } = await supabase
        .from("users")
        .select("*")
        .eq("wallet_address", walletAddress)
        .single()

      if (!existingUser) {
        // Create new user
        const { error } = await supabase.from("users").insert({
          wallet_address: walletAddress,
          username: `user_${walletAddress.slice(-6)}`,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating user:", error)
        }
      } else {
        // Update last seen
        const { error } = await supabase
          .from("users")
          .update({ updated_at: new Date().toISOString() })
          .eq("wallet_address", walletAddress)

        if (error) {
          console.error("Error updating user:", error)
        }
      }
    } catch (error) {
      console.error("Error updating user in Supabase:", error)
    }
  }

  const connectWallet = async () => {
    if (typeof window === "undefined" || !window.ethereum) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension to connect your wallet.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      })

      if (accounts.length > 0) {
        setAccount(accounts[0])
        setIsConnected(true)

        // Get chain ID
        const chainId = await window.ethereum.request({ method: "eth_chainId" })
        setChainId(Number.parseInt(chainId, 16))

        // Get balance
        const balance = await window.ethereum.request({
          method: "eth_getBalance",
          params: [accounts[0], "latest"],
        })
        const balanceInEth = Number.parseInt(balance, 16) / Math.pow(10, 18)
        setBalance(balanceInEth.toFixed(4))

        // Update user in Supabase
        await updateUserInSupabase(accounts[0])

        toast({
          title: "Wallet connected",
          description: `Connected to ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`,
        })
      }
    } catch (error: any) {
      if (error.code === 4001) {
        setError("Please connect to MetaMask.")
        toast({
          title: "Connection rejected",
          description: "You rejected the connection request.",
          variant: "destructive",
        })
      } else {
        setError("An error occurred while connecting to MetaMask.")
        toast({
          title: "Connection failed",
          description: "Failed to connect to MetaMask. Please try again.",
          variant: "destructive",
        })
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
    setError(null)

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
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
        const networkData = getNetworkData(targetChainId)
        if (networkData) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [networkData],
            })
          } catch (addError) {
            setError("Failed to add network to MetaMask.")
            toast({
              title: "Network error",
              description: "Failed to add network to MetaMask.",
              variant: "destructive",
            })
          }
        }
      } else {
        setError("Failed to switch network.")
        toast({
          title: "Network switch failed",
          description: "Failed to switch network. Please try again.",
          variant: "destructive",
        })
      }
      console.error("Error switching network:", error)
    }
  }

  const getNetworkData = (chainId: number) => {
    const networks: { [key: number]: any } = {
      1: {
        chainId: "0x1",
        chainName: "Ethereum Mainnet",
        nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://mainnet.infura.io/v3/"],
        blockExplorerUrls: ["https://etherscan.io/"],
      },
      137: {
        chainId: "0x89",
        chainName: "Polygon Mainnet",
        nativeCurrency: { name: "MATIC", symbol: "MATIC", decimals: 18 },
        rpcUrls: ["https://polygon-rpc.com/"],
        blockExplorerUrls: ["https://polygonscan.com/"],
      },
      11155111: {
        chainId: "0xaa36a7",
        chainName: "Sepolia Testnet",
        nativeCurrency: { name: "Sepolia Ether", symbol: "ETH", decimals: 18 },
        rpcUrls: ["https://sepolia.infura.io/v3/"],
        blockExplorerUrls: ["https://sepolia.etherscan.io/"],
      },
    }
    return networks[chainId]
  }

  useEffect(() => {
    checkIfWalletIsConnected()

    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else {
          setAccount(accounts[0])
          updateUserInSupabase(accounts[0])
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
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
        }
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
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

declare global {
  interface Window {
    ethereum?: any
  }
}
