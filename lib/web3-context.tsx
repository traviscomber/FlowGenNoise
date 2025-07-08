"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import { supabase } from "@/lib/supabase"
import { useToast } from "@/hooks/use-toast"

interface Web3ContextType {
  // Wallet state
  account: string | null
  balance: string
  chainId: number | null
  isConnected: boolean
  isConnecting: boolean
  error: string | null

  // Provider and signer
  provider: ethers.BrowserProvider | null
  signer: ethers.JsonRpcSigner | null

  // Actions
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  switchNetwork: (chainId: number) => Promise<void>

  // NFT functions
  mintNFT: (tokenURI: string, price: string) => Promise<string>
  purchaseNFT: (tokenId: string, price: string) => Promise<string>
  transferNFT: (to: string, tokenId: string) => Promise<string>
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

export function useWeb3() {
  const context = useContext(Web3Context)
  if (context === undefined) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return context
}

// Supported networks configuration
const SUPPORTED_NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    symbol: "ETH",
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
  11155111: {
    name: "Sepolia Testnet",
    symbol: "ETH",
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
  137: {
    name: "Polygon Mainnet",
    symbol: "MATIC",
    rpcUrl: "https://polygon-rpc.com/",
    explorerUrl: "https://polygonscan.com",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
  80001: {
    name: "Mumbai Testnet",
    symbol: "MATIC",
    rpcUrl: "https://rpc-mumbai.maticvigil.com/",
    explorerUrl: "https://mumbai.polygonscan.com",
    contractAddress: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6",
  },
}

// NFT Contract ABI (simplified for marketplace functions)
const NFT_CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function purchase(uint256 tokenId) public payable",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function tokenURI(uint256 tokenId) public view returns (string)",
  "function totalSupply() public view returns (uint256)",
  "function balanceOf(address owner) public view returns (uint256)",
  "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)",
  "event Purchase(address indexed buyer, uint256 indexed tokenId, uint256 price)",
]

interface Web3ProviderProps {
  children: React.ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [account, setAccount] = useState<string | null>(null)
  const [balance, setBalance] = useState("0")
  const [chainId, setChainId] = useState<number | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null)
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null)

  const { toast } = useToast()

  // Check if wallet is already connected
  const checkConnection = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum)
        const accounts = await provider.listAccounts()

        if (accounts.length > 0) {
          const signer = await provider.getSigner()
          const network = await provider.getNetwork()
          const balance = await provider.getBalance(accounts[0].address)

          setProvider(provider)
          setSigner(signer)
          setAccount(accounts[0].address)
          setChainId(Number(network.chainId))
          setBalance(ethers.formatEther(balance))
          setIsConnected(true)

          // Update user in Supabase
          await updateUserInSupabase(accounts[0].address, Number(network.chainId))
        }
      } catch (error) {
        console.error("Error checking connection:", error)
      }
    }
  }, [])

  // Update or create user in Supabase
  const updateUserInSupabase = async (walletAddress: string, chainId: number) => {
    try {
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
          display_name: `User ${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
          chain_id: chainId,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })

        if (error) {
          console.error("Error creating user:", error)
        }
      } else {
        // Update existing user
        const { error } = await supabase
          .from("users")
          .update({
            chain_id: chainId,
            updated_at: new Date().toISOString(),
          })
          .eq("wallet_address", walletAddress)

        if (error) {
          console.error("Error updating user:", error)
        }
      }
    } catch (error) {
      console.error("Error with Supabase user operations:", error)
    }
  }

  // Connect wallet
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
      const provider = new ethers.BrowserProvider(window.ethereum)
      await provider.send("eth_requestAccounts", [])

      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      setProvider(provider)
      setSigner(signer)
      setAccount(address)
      setChainId(Number(network.chainId))
      setBalance(ethers.formatEther(balance))
      setIsConnected(true)

      // Update user in Supabase
      await updateUserInSupabase(address, Number(network.chainId))

      toast({
        title: "Wallet connected",
        description: `Connected to ${address.slice(0, 6)}...${address.slice(-4)}`,
      })

      // Store connection preference
      localStorage.setItem("walletConnected", "true")
    } catch (error: any) {
      console.error("Error connecting wallet:", error)
      if (error.code === 4001) {
        setError("Connection rejected by user")
        toast({
          title: "Connection rejected",
          description: "You rejected the connection request.",
          variant: "destructive",
        })
      } else {
        setError("Failed to connect wallet")
        toast({
          title: "Connection failed",
          description: "Failed to connect to MetaMask. Please try again.",
          variant: "destructive",
        })
      }
    } finally {
      setIsConnecting(false)
    }
  }

  // Disconnect wallet
  const disconnectWallet = () => {
    setAccount(null)
    setBalance("0")
    setChainId(null)
    setIsConnected(false)
    setProvider(null)
    setSigner(null)
    setError(null)

    localStorage.removeItem("walletConnected")

    toast({
      title: "Wallet disconnected",
      description: "Your wallet has been disconnected successfully.",
    })
  }

  // Switch network
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
        const network = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]
        if (network) {
          try {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: `0x${targetChainId.toString(16)}`,
                  chainName: network.name,
                  nativeCurrency: {
                    name: network.symbol,
                    symbol: network.symbol,
                    decimals: 18,
                  },
                  rpcUrls: [network.rpcUrl],
                  blockExplorerUrls: [network.explorerUrl],
                },
              ],
            })
          } catch (addError) {
            console.error("Error adding network:", addError)
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
          description: "Failed to switch network. Please try again.",
          variant: "destructive",
        })
      }
    }
  }

  // Mint NFT
  const mintNFT = async (tokenURI: string, price: string): Promise<string> => {
    if (!signer || !chainId) {
      throw new Error("Wallet not connected")
    }

    const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
    if (!network) {
      throw new Error("Unsupported network")
    }

    try {
      const contract = new ethers.Contract(network.contractAddress, NFT_CONTRACT_ABI, signer)
      const tx = await contract.mint(account, tokenURI)

      toast({
        title: "Minting NFT",
        description: "Transaction submitted. Please wait for confirmation.",
      })

      const receipt = await tx.wait()

      // Log transaction in Supabase
      await supabase.from("blockchain_transactions").insert({
        tx_hash: tx.hash,
        from_address: account,
        to_address: network.contractAddress,
        transaction_type: "mint",
        chain_id: chainId,
        gas_used: receipt.gasUsed.toString(),
        gas_price: tx.gasPrice?.toString(),
        status: "completed",
        created_at: new Date().toISOString(),
      })

      return tx.hash
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      throw new Error(error.message || "Failed to mint NFT")
    }
  }

  // Purchase NFT
  const purchaseNFT = async (tokenId: string, price: string): Promise<string> => {
    if (!signer || !chainId) {
      throw new Error("Wallet not connected")
    }

    const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
    if (!network) {
      throw new Error("Unsupported network")
    }

    try {
      const contract = new ethers.Contract(network.contractAddress, NFT_CONTRACT_ABI, signer)
      const tx = await contract.purchase(tokenId, {
        value: ethers.parseEther(price),
      })

      toast({
        title: "Purchasing NFT",
        description: "Transaction submitted. Please wait for confirmation.",
      })

      const receipt = await tx.wait()

      // Log transaction in Supabase
      await supabase.from("blockchain_transactions").insert({
        tx_hash: tx.hash,
        from_address: account,
        to_address: network.contractAddress,
        transaction_type: "purchase",
        chain_id: chainId,
        value: ethers.parseEther(price).toString(),
        gas_used: receipt.gasUsed.toString(),
        gas_price: tx.gasPrice?.toString(),
        status: "completed",
        token_id: tokenId,
        created_at: new Date().toISOString(),
      })

      return tx.hash
    } catch (error: any) {
      console.error("Error purchasing NFT:", error)
      throw new Error(error.message || "Failed to purchase NFT")
    }
  }

  // Transfer NFT
  const transferNFT = async (to: string, tokenId: string): Promise<string> => {
    if (!signer || !chainId || !account) {
      throw new Error("Wallet not connected")
    }

    const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
    if (!network) {
      throw new Error("Unsupported network")
    }

    try {
      const contract = new ethers.Contract(network.contractAddress, NFT_CONTRACT_ABI, signer)
      const tx = await contract.transferFrom(account, to, tokenId)

      toast({
        title: "Transferring NFT",
        description: "Transaction submitted. Please wait for confirmation.",
      })

      const receipt = await tx.wait()

      // Log transaction in Supabase
      await supabase.from("blockchain_transactions").insert({
        tx_hash: tx.hash,
        from_address: account,
        to_address: to,
        transaction_type: "transfer",
        chain_id: chainId,
        gas_used: receipt.gasUsed.toString(),
        gas_price: tx.gasPrice?.toString(),
        status: "completed",
        token_id: tokenId,
        created_at: new Date().toISOString(),
      })

      return tx.hash
    } catch (error: any) {
      console.error("Error transferring NFT:", error)
      throw new Error(error.message || "Failed to transfer NFT")
    }
  }

  // Event listeners for account and network changes
  useEffect(() => {
    if (typeof window !== "undefined" && window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== account) {
          setAccount(accounts[0])
          if (chainId) {
            updateUserInSupabase(accounts[0], chainId)
          }
        }
      }

      const handleChainChanged = (chainId: string) => {
        const newChainId = Number.parseInt(chainId, 16)
        setChainId(newChainId)
        if (account) {
          updateUserInSupabase(account, newChainId)
        }
        window.location.reload()
      }

      const handleDisconnect = () => {
        disconnectWallet()
      }

      window.ethereum.on("accountsChanged", handleAccountsChanged)
      window.ethereum.on("chainChanged", handleChainChanged)
      window.ethereum.on("disconnect", handleDisconnect)

      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener("accountsChanged", handleAccountsChanged)
          window.ethereum.removeListener("chainChanged", handleChainChanged)
          window.ethereum.removeListener("disconnect", handleDisconnect)
        }
      }
    }
  }, [account, chainId])

  // Check connection on mount
  useEffect(() => {
    checkConnection()
  }, [checkConnection])

  const value: Web3ContextType = {
    account,
    balance,
    chainId,
    isConnected,
    isConnecting,
    error,
    provider,
    signer,
    connectWallet,
    disconnectWallet,
    switchNetwork,
    mintNFT,
    purchaseNFT,
    transferNFT,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any
  }
}
