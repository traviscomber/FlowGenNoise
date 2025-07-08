"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState, useCallback } from "react"
import { ethers } from "ethers"
import { supabase } from "@/lib/supabase"
import {
  logTransactionToSupabase,
  CONTRACT_ADDRESSES,
  NETWORK_CONFIG,
  testPinataConnection,
} from "@/lib/blockchain-utils"

interface Web3ContextType {
  // Connection state
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string

  // Provider and signer
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null

  // Connection functions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>

  // NFT functions
  mintNFT: (tokenURI: string, price: string) => Promise<string>
  purchaseNFT: (tokenId: string, price: string) => Promise<string>
  transferNFT: (to: string, tokenId: string) => Promise<string>

  // Utility functions
  getBalance: () => Promise<void>
  isNetworkSupported: (chainId: number) => boolean

  // Loading states
  isConnecting: boolean
  isMinting: boolean
  isPurchasing: boolean
  isTransferring: boolean

  // Error handling
  error: string | null
  clearError: () => void
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  // State
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState("0")
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  // Loading states
  const [isConnecting, setIsConnecting] = useState(false)
  const [isMinting, setIsMinting] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [isTransferring, setIsTransferring] = useState(false)

  // Error handling
  const [error, setError] = useState<string | null>(null)

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const isNetworkSupported = useCallback((chainId: number) => {
    return chainId in NETWORK_CONFIG
  }, [])

  // Check if MetaMask is installed
  const isMetaMaskInstalled = useCallback(() => {
    return typeof window !== "undefined" && typeof window.ethereum !== "undefined"
  }, [])

  // Get balance
  const getBalance = useCallback(async () => {
    if (!provider || !account) return

    try {
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))
    } catch (error) {
      console.error("Error getting balance:", error)
    }
  }, [provider, account])

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!isMetaMaskInstalled()) {
      setError("MetaMask is not installed. Please install MetaMask to continue.")
      return
    }

    setIsConnecting(true)
    setError(null)

    try {
      // Test Pinata connection first
      const pinataConnected = await testPinataConnection()
      if (!pinataConnected) {
        console.warn("Pinata connection test failed - IPFS uploads may not work")
      }

      const ethereum = window.ethereum
      const accounts = await ethereum.request({ method: "eth_requestAccounts" })

      if (accounts.length === 0) {
        throw new Error("No accounts found")
      }

      const provider = new ethers.BrowserProvider(ethereum)
      const signer = await provider.getSigner()
      const network = await provider.getNetwork()

      const account = accounts[0]
      const chainId = Number(network.chainId)

      setProvider(provider)
      setSigner(signer)
      setAccount(account)
      setChainId(chainId)
      setIsConnected(true)

      // Get balance
      const balance = await provider.getBalance(account)
      setBalance(ethers.formatEther(balance))

      // Create or update user in Supabase
      try {
        const { data: existingUser } = await supabase
          .from("users")
          .select("*")
          .eq("wallet_address", account.toLowerCase())
          .single()

        if (!existingUser) {
          const { error: insertError } = await supabase.from("users").insert({
            wallet_address: account.toLowerCase(),
            username: `User_${account.slice(-6)}`,
            email: null,
            avatar_url: `https://api.dicebear.com/7.x/identicon/svg?seed=${account}`,
            bio: "NFT Collector",
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })

          if (insertError) {
            console.error("Error creating user:", insertError)
          }
        } else {
          // Update last seen
          await supabase
            .from("users")
            .update({ updated_at: new Date().toISOString() })
            .eq("wallet_address", account.toLowerCase())
        }
      } catch (error) {
        console.error("Error managing user in Supabase:", error)
      }

      console.log("Wallet connected:", { account, chainId })
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      setError(error.message || "Failed to connect wallet")
    } finally {
      setIsConnecting(false)
    }
  }, [isMetaMaskInstalled])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setProvider(null)
    setSigner(null)
    setAccount(null)
    setChainId(null)
    setBalance("0")
    setIsConnected(false)
    setError(null)
    console.log("Wallet disconnected")
  }, [])

  // Switch network
  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!isMetaMaskInstalled()) {
        setError("MetaMask is not installed")
        return
      }

      if (!isNetworkSupported(targetChainId)) {
        setError("Network not supported")
        return
      }

      try {
        const ethereum = window.ethereum
        const chainIdHex = `0x${targetChainId.toString(16)}`

        await ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (error: any) {
        if (error.code === 4902) {
          // Network not added to MetaMask
          const networkConfig = NETWORK_CONFIG[targetChainId as keyof typeof NETWORK_CONFIG]
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: networkConfig.name,
                  nativeCurrency: {
                    name: networkConfig.symbol,
                    symbol: networkConfig.symbol,
                    decimals: networkConfig.decimals,
                  },
                  rpcUrls: [networkConfig.rpcUrl],
                  blockExplorerUrls: [networkConfig.explorerUrl],
                },
              ],
            })
          } catch (addError) {
            console.error("Error adding network:", addError)
            setError("Failed to add network to MetaMask")
          }
        } else {
          console.error("Error switching network:", error)
          setError("Failed to switch network")
        }
      }
    },
    [isMetaMaskInstalled, isNetworkSupported],
  )

  // Mint NFT
  const mintNFT = useCallback(
    async (tokenURI: string, price: string): Promise<string> => {
      if (!signer || !account || !chainId) {
        throw new Error("Wallet not connected")
      }

      if (!isNetworkSupported(chainId)) {
        throw new Error("Network not supported")
      }

      setIsMinting(true)
      setError(null)

      try {
        // For demo purposes, we'll simulate the minting process
        // In a real implementation, you would interact with your NFT contract

        const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
        if (!contractAddress) {
          throw new Error("Contract not deployed on this network")
        }

        // Simulate transaction
        const tx = await signer.sendTransaction({
          to: contractAddress,
          value: ethers.parseEther("0.001"), // Small fee for minting
          data: "0x", // Contract call data would go here
        })

        console.log("Minting transaction sent:", tx.hash)

        // Wait for confirmation
        const receipt = await tx.wait()
        console.log("Minting confirmed:", receipt)

        // Log transaction
        await logTransactionToSupabase({
          txHash: tx.hash,
          fromAddress: account,
          toAddress: contractAddress,
          transactionType: "mint",
          chainId,
          value: ethers.parseEther("0.001").toString(),
          gasUsed: receipt?.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
          status: "completed",
        })

        return tx.hash
      } catch (error: any) {
        console.error("Minting error:", error)
        setError(error.message || "Failed to mint NFT")
        throw error
      } finally {
        setIsMinting(false)
      }
    },
    [signer, account, chainId, isNetworkSupported],
  )

  // Purchase NFT
  const purchaseNFT = useCallback(
    async (tokenId: string, price: string): Promise<string> => {
      if (!signer || !account || !chainId) {
        throw new Error("Wallet not connected")
      }

      if (!isNetworkSupported(chainId)) {
        throw new Error("Network not supported")
      }

      setIsPurchasing(true)
      setError(null)

      try {
        const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
        if (!contractAddress) {
          throw new Error("Contract not deployed on this network")
        }

        // Send purchase transaction
        const tx = await signer.sendTransaction({
          to: contractAddress,
          value: ethers.parseEther(price),
          data: "0x", // Contract call data would go here
        })

        console.log("Purchase transaction sent:", tx.hash)

        // Wait for confirmation
        const receipt = await tx.wait()
        console.log("Purchase confirmed:", receipt)

        // Log transaction
        await logTransactionToSupabase({
          txHash: tx.hash,
          fromAddress: account,
          toAddress: contractAddress,
          transactionType: "purchase",
          chainId,
          value: ethers.parseEther(price).toString(),
          gasUsed: receipt?.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
          tokenId,
          status: "completed",
        })

        // Update balance
        await getBalance()

        return tx.hash
      } catch (error: any) {
        console.error("Purchase error:", error)
        setError(error.message || "Failed to purchase NFT")
        throw error
      } finally {
        setIsPurchasing(false)
      }
    },
    [signer, account, chainId, isNetworkSupported, getBalance],
  )

  // Transfer NFT
  const transferNFT = useCallback(
    async (to: string, tokenId: string): Promise<string> => {
      if (!signer || !account || !chainId) {
        throw new Error("Wallet not connected")
      }

      if (!ethers.isAddress(to)) {
        throw new Error("Invalid recipient address")
      }

      setIsTransferring(true)
      setError(null)

      try {
        const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
        if (!contractAddress) {
          throw new Error("Contract not deployed on this network")
        }

        // Send transfer transaction
        const tx = await signer.sendTransaction({
          to: contractAddress,
          value: 0,
          data: "0x", // Contract call data would go here
        })

        console.log("Transfer transaction sent:", tx.hash)

        // Wait for confirmation
        const receipt = await tx.wait()
        console.log("Transfer confirmed:", receipt)

        // Log transaction
        await logTransactionToSupabase({
          txHash: tx.hash,
          fromAddress: account,
          toAddress: to,
          transactionType: "transfer",
          chainId,
          gasUsed: receipt?.gasUsed?.toString(),
          gasPrice: tx.gasPrice?.toString(),
          tokenId,
          status: "completed",
        })

        return tx.hash
      } catch (error: any) {
        console.error("Transfer error:", error)
        setError(error.message || "Failed to transfer NFT")
        throw error
      } finally {
        setIsTransferring(false)
      }
    },
    [signer, account, chainId],
  )

  // Handle account changes
  useEffect(() => {
    if (!isMetaMaskInstalled()) return

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) {
        disconnectWallet()
      } else if (accounts[0] !== account) {
        setAccount(accounts[0])
        getBalance()
      }
    }

    const handleChainChanged = (chainId: string) => {
      const newChainId = Number.parseInt(chainId, 16)
      setChainId(newChainId)
      getBalance()
    }

    const handleDisconnect = () => {
      disconnectWallet()
    }

    const ethereum = window.ethereum
    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)
    ethereum.on("disconnect", handleDisconnect)

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
      ethereum.removeListener("disconnect", handleDisconnect)
    }
  }, [isMetaMaskInstalled, account, disconnectWallet, getBalance])

  // Auto-connect if previously connected
  useEffect(() => {
    const autoConnect = async () => {
      if (!isMetaMaskInstalled()) return

      try {
        const ethereum = window.ethereum
        const accounts = await ethereum.request({ method: "eth_accounts" })

        if (accounts.length > 0) {
          await connectWallet()
        }
      } catch (error) {
        console.error("Auto-connect error:", error)
      }
    }

    autoConnect()
  }, [isMetaMaskInstalled, connectWallet])

  const value: Web3ContextType = {
    // Connection state
    isConnected,
    account,
    chainId,
    balance,

    // Provider and signer
    provider,
    signer,

    // Connection functions
    connectWallet,
    disconnectWallet,
    switchNetwork,

    // NFT functions
    mintNFT,
    purchaseNFT,
    transferNFT,

    // Utility functions
    getBalance,
    isNetworkSupported,

    // Loading states
    isConnecting,
    isMinting,
    isPurchasing,
    isTransferring,

    // Error handling
    error,
    clearError,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Type declaration for window.ethereum
declare global {
  interface Window {
    ethereum?: any
  }
}
