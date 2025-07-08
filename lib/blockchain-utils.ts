import { ethers } from "ethers"

// Supported networks configuration
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
  80001: {
    name: "Mumbai Testnet",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    currency: "MATIC",
  },
}

// Contract addresses (replace with your deployed contracts)
const CONTRACT_ADDRESSES = {
  1: "0x...", // Ethereum Mainnet
  11155111: "0x...", // Sepolia Testnet
  137: "0x...", // Polygon Mainnet
  80001: "0x...", // Mumbai Testnet
}

// Helper functions
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getNetworkName(chainId: number): string {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || "Unknown Network"
}

export function formatEthAmount(amount: string): string {
  try {
    const parsed = ethers.parseEther(amount)
    return ethers.formatEther(parsed)
  } catch {
    return "0"
  }
}

// Pinata IPFS functions
export async function uploadImageToPinata(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const pinataMetadata = JSON.stringify({
      name: `FlowSketch-${Date.now()}`,
      keyvalues: {
        type: "artwork",
        timestamp: Date.now().toString(),
      },
    })
    formData.append("pinataMetadata", pinataMetadata)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error("Error uploading to Pinata:", error)
    throw new Error("Failed to upload image to IPFS")
  }
}

export async function uploadMetadataToPinata(metadata: object): Promise<string> {
  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: `FlowSketch-Metadata-${Date.now()}`,
          keyvalues: {
            type: "metadata",
            timestamp: Date.now().toString(),
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error)
    throw new Error("Failed to upload metadata to IPFS")
  }
}

// NFT Contract interactions
export async function mintNFT(tokenURI: string, price: string, chainId: number): Promise<string> {
  try {
    if (typeof window === "undefined" || !(window as any).ethereum) {
      throw new Error("MetaMask not available")
    }

    const provider = new ethers.BrowserProvider((window as any).ethereum)
    const signer = await provider.getSigner()

    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!contractAddress) {
      throw new Error(`Contract not deployed on network ${chainId}`)
    }

    // Simple ERC721 ABI for minting
    const abi = [
      "function mint(address to, string memory tokenURI) public returns (uint256)",
      "function setTokenPrice(uint256 tokenId, uint256 price) public",
    ]

    const contract = new ethers.Contract(contractAddress, abi, signer)
    const address = await signer.getAddress()

    // Mint the NFT
    const mintTx = await contract.mint(address, tokenURI)
    const receipt = await mintTx.wait()

    console.log("NFT minted successfully:", receipt.hash)
    return receipt.hash
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

    const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
    if (!contractAddress) {
      throw new Error(`Contract not deployed on network ${chainId}`)
    }

    // Simple marketplace ABI
    const abi = ["function purchaseToken(uint256 tokenId) public payable"]

    const contract = new ethers.Contract(contractAddress, abi, signer)
    const priceInWei = ethers.parseEther(price)

    // Purchase the NFT
    const purchaseTx = await contract.purchaseToken(tokenId, { value: priceInWei })
    const receipt = await purchaseTx.wait()

    console.log("NFT purchased successfully:", receipt.hash)
    return receipt.hash
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    throw error
  }
}

// Database logging
export async function logTransactionToSupabase(
  transactionHash: string,
  type: "mint" | "purchase",
  tokenId?: string,
  price?: string,
  userAddress?: string,
) {
  try {
    const { supabase } = await import("./supabase")

    const { error } = await supabase.from("blockchain_transactions").insert({
      transaction_hash: transactionHash,
      transaction_type: type,
      token_id: tokenId,
      price_eth: price,
      user_address: userAddress,
      network_id: 1, // Default to mainnet
      status: "pending",
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("Error logging transaction:", error)
    } else {
      console.log("Transaction logged successfully")
    }
  } catch (error) {
    console.error("Error logging transaction to database:", error)
  }
}

// Test Pinata connection
export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
    })

    if (response.ok) {
      console.log("Pinata connection successful")
      return true
    } else {
      console.error("Pinata connection failed:", response.statusText)
      return false
    }
  } catch (error) {
    console.error("Error testing Pinata connection:", error)
    return false
  }
}

// Helper function to create NFT metadata
export function createNFTMetadata(name: string, description: string, imageUrl: string, attributes?: any[]) {
  return {
    name,
    description,
    image: imageUrl,
    attributes: attributes || [],
    external_url: "https://flowsketch.art",
    created_at: new Date().toISOString(),
  }
}

// Aliases for missing exports (for compatibility)
export const uploadToIPFS = uploadImageToPinata
export const uploadMetadataToIPFS = uploadMetadataToPinata
