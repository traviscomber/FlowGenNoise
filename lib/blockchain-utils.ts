import { ethers } from "ethers"
import { supabase } from "@/lib/supabase"

// IPFS configuration for metadata storage
export const IPFS_GATEWAY = "https://gateway.pinata.cloud/ipfs/"
export const PINATA_API_KEY = process.env.NEXT_PUBLIC_PINATA_API_KEY
export const PINATA_SECRET_KEY = process.env.NEXT_PUBLIC_PINATA_SECRET_KEY

// Contract addresses for different networks
export const CONTRACT_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Ethereum Mainnet
  11155111: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Sepolia Testnet
  137: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Polygon Mainnet
  80001: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Mumbai Testnet
}

// Network configurations
export const NETWORK_CONFIG = {
  1: {
    name: "Ethereum Mainnet",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://mainnet.infura.io/v3/",
    explorerUrl: "https://etherscan.io",
    explorerApiUrl: "https://api.etherscan.io/api",
  },
  11155111: {
    name: "Sepolia Testnet",
    symbol: "ETH",
    decimals: 18,
    rpcUrl: "https://sepolia.infura.io/v3/",
    explorerUrl: "https://sepolia.etherscan.io",
    explorerApiUrl: "https://api-sepolia.etherscan.io/api",
  },
  137: {
    name: "Polygon Mainnet",
    symbol: "MATIC",
    decimals: 18,
    rpcUrl: "https://polygon-rpc.com/",
    explorerUrl: "https://polygonscan.com",
    explorerApiUrl: "https://api.polygonscan.com/api",
  },
  80001: {
    name: "Mumbai Testnet",
    symbol: "MATIC",
    decimals: 18,
    rpcUrl: "https://rpc-mumbai.maticvigil.com/",
    explorerUrl: "https://mumbai.polygonscan.com",
    explorerApiUrl: "https://api-testnet.polygonscan.com/api",
  },
}

// Upload image to IPFS via Pinata
export async function uploadToIPFS(file: File): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("IPFS configuration missing")
  }

  const formData = new FormData()
  formData.append("file", file)

  const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
    method: "POST",
    headers: {
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload to IPFS")
  }

  const data = await response.json()
  return data.IpfsHash
}

// Upload JSON metadata to IPFS
export async function uploadMetadataToIPFS(metadata: any): Promise<string> {
  if (!PINATA_API_KEY || !PINATA_SECRET_KEY) {
    throw new Error("IPFS configuration missing")
  }

  const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      pinata_api_key: PINATA_API_KEY,
      pinata_secret_api_key: PINATA_SECRET_KEY,
    },
    body: JSON.stringify(metadata),
  })

  if (!response.ok) {
    throw new Error("Failed to upload metadata to IPFS")
  }

  const data = await response.json()
  return data.IpfsHash
}

// Create NFT metadata
export function createNFTMetadata(artwork: {
  title: string
  description: string
  artist: string
  imageHash: string
  attributes: Array<{ trait_type: string; value: string }>
}) {
  return {
    name: artwork.title,
    description: artwork.description,
    image: `${IPFS_GATEWAY}${artwork.imageHash}`,
    artist: artwork.artist,
    attributes: artwork.attributes,
    external_url: `${window.location.origin}/artwork/${artwork.title}`,
    created_at: new Date().toISOString(),
  }
}

// Get transaction details from blockchain
export async function getTransactionDetails(txHash: string, chainId: number) {
  const network = NETWORK_CONFIG[chainId as keyof typeof NETWORK_CONFIG]
  if (!network) {
    throw new Error("Unsupported network")
  }

  try {
    const response = await fetch(
      `${network.explorerApiUrl}?module=transaction&action=gettxreceiptstatus&txhash=${txHash}&apikey=YourApiKeyToken`,
    )
    const data = await response.json()
    return data.result
  } catch (error) {
    console.error("Error fetching transaction details:", error)
    return null
  }
}

// Validate Ethereum address
export function isValidEthereumAddress(address: string): boolean {
  return ethers.isAddress(address)
}

// Format ETH amount
export function formatEthAmount(amount: string | number, decimals = 4): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return num.toFixed(decimals)
}

// Convert Wei to ETH
export function weiToEth(wei: string): string {
  return ethers.formatEther(wei)
}

// Convert ETH to Wei
export function ethToWei(eth: string): bigint {
  return ethers.parseEther(eth)
}

// Get gas price estimation
export async function getGasPrice(provider: ethers.BrowserProvider): Promise<bigint> {
  try {
    const feeData = await provider.getFeeData()
    return feeData.gasPrice || ethers.parseUnits("20", "gwei")
  } catch (error) {
    console.error("Error getting gas price:", error)
    return ethers.parseUnits("20", "gwei")
  }
}

// Estimate gas for transaction
export async function estimateGas(contract: ethers.Contract, method: string, params: any[]): Promise<bigint> {
  try {
    return await contract[method].estimateGas(...params)
  } catch (error) {
    console.error("Error estimating gas:", error)
    return BigInt(100000) // Default gas limit
  }
}

// Log blockchain transaction to Supabase
export async function logTransactionToSupabase(transaction: {
  txHash: string
  fromAddress: string
  toAddress: string
  transactionType: string
  chainId: number
  value?: string
  gasUsed?: string
  gasPrice?: string
  tokenId?: string
  status: string
}) {
  try {
    const { error } = await supabase.from("blockchain_transactions").insert({
      tx_hash: transaction.txHash,
      from_address: transaction.fromAddress,
      to_address: transaction.toAddress,
      transaction_type: transaction.transactionType,
      chain_id: transaction.chainId,
      value: transaction.value,
      gas_used: transaction.gasUsed,
      gas_price: transaction.gasPrice,
      token_id: transaction.tokenId,
      status: transaction.status,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error logging transaction to Supabase:", error)
    }
  } catch (error) {
    console.error("Error logging transaction:", error)
  }
}

// Get user's NFT balance
export async function getUserNFTBalance(address: string, chainId: number): Promise<number> {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!contractAddress) {
    return 0
  }

  try {
    const { data, error } = await supabase
      .from("blockchain_transactions")
      .select("*")
      .eq("to_address", address)
      .eq("transaction_type", "purchase")
      .eq("chain_id", chainId)
      .eq("status", "completed")

    if (error) {
      console.error("Error fetching NFT balance:", error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error("Error getting NFT balance:", error)
    return 0
  }
}

// Get transaction history for user
export async function getUserTransactionHistory(address: string, chainId?: number) {
  try {
    let query = supabase
      .from("blockchain_transactions")
      .select("*")
      .or(`from_address.eq.${address},to_address.eq.${address}`)
      .order("created_at", { ascending: false })

    if (chainId) {
      query = query.eq("chain_id", chainId)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching transaction history:", error)
      return []
    }

    return data || []
  } catch (error) {
    console.error("Error getting transaction history:", error)
    return []
  }
}
