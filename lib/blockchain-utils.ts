import { ethers } from "ethers"

// Network configurations
export const SUPPORTED_NETWORKS = {
  1: {
    name: "Ethereum Mainnet",
    rpcUrl: "https://mainnet.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://etherscan.io",
    currency: "ETH",
  },
  11155111: {
    name: "Sepolia Testnet",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    currency: "ETH",
  },
  137: {
    name: "Polygon Mainnet",
    rpcUrl: "https://polygon-rpc.com",
    blockExplorer: "https://polygonscan.com",
    currency: "MATIC",
  },
}

// Contract addresses (replace with your actual deployed contracts)
const CONTRACT_ADDRESSES = {
  1: "0x0000000000000000000000000000000000000000", // Ethereum Mainnet
  11155111: "0x0000000000000000000000000000000000000000", // Sepolia
  137: "0x0000000000000000000000000000000000000000", // Polygon
}

// Utility functions
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatEthAmount(amount: string): string {
  try {
    const parsed = ethers.parseEther(amount)
    return ethers.formatEther(parsed)
  } catch {
    return "0"
  }
}

export function getNetworkName(chainId: number): string {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || "Unknown Network"
}

// IPFS/Pinata functions
export async function uploadImageToPinata(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const response = await fetch("/api/upload-to-pinata", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload to Pinata")
    }

    const data = await response.json()
    return data.ipfsHash
  } catch (error) {
    console.error("Error uploading to Pinata:", error)
    throw error
  }
}

export async function uploadMetadataToPinata(metadata: object): Promise<string> {
  try {
    const response = await fetch("/api/upload-metadata-to-pinata", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(metadata),
    })

    if (!response.ok) {
      throw new Error("Failed to upload metadata to Pinata")
    }

    const data = await response.json()
    return data.ipfsHash
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error)
    throw error
  }
}

export function createNFTMetadata(name: string, description: string, imageUrl: string, attributes?: any[]) {
  return {
    name,
    description,
    image: imageUrl,
    attributes: attributes || [],
    external_url: "",
    background_color: "",
    animation_url: "",
    youtube_url: "",
  }
}

// Blockchain transaction functions
export async function mintNFT(tokenURI: string, price: string, chainId: number): Promise<string> {
  try {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("MetaMask not available")
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()

    // This is a placeholder - replace with your actual contract interaction
    console.log("Minting NFT:", { tokenURI, price, chainId })

    // Simulate transaction hash
    return "0x" + Math.random().toString(16).substring(2, 66)
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

export async function purchaseNFT(tokenId: string, price: string, chainId: number): Promise<string> {
  try {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("MetaMask not available")
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()

    // This is a placeholder - replace with your actual contract interaction
    console.log("Purchasing NFT:", { tokenId, price, chainId })

    // Simulate transaction hash
    return "0x" + Math.random().toString(16).substring(2, 66)
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    throw error
  }
}

// Database logging function
export async function logTransactionToSupabase(transactionData: {
  txHash: string
  type: "mint" | "purchase"
  tokenId?: string
  price: string
  userAddress: string
  chainId: number
}) {
  try {
    const response = await fetch("/api/log-transaction", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    })

    if (!response.ok) {
      throw new Error("Failed to log transaction")
    }

    return await response.json()
  } catch (error) {
    console.error("Error logging transaction:", error)
    throw error
  }
}

// Export aliases for compatibility with existing imports
export const uploadToIPFS = uploadImageToPinata
export const uploadMetadataToIPFS = uploadMetadataToPinata
