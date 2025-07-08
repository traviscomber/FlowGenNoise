// Blockchain utilities for Web3 integration with Pinata IPFS
import { ethers } from "ethers"

// Pinata configuration with your JWT token
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYjk3NGQ3MC04YjY4LTQwYWEtYjAxNi03MDZmZDVkMzgwZDIiLCJlbWFpbCI6InRyYXZpc0BudWFudS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTZmOGE1MWQ0MmVlMDMwNTVkYjYiLCJzY29wZWRLZXlTZWNyZXQiOiI5NjBhY2E4ODczZmM0YmJlZDM1ZjI3YjExMzVlNDcwN2E4YmVhMjU4ZmE3ZGM5M2Q5OWI5YjBkMDI3Mjc2MjlkIiwiZXhwIjoxNzgzNTA4MDkzfQ.mtNbbvsudKtYDFyS1NaP0DsmlNW4CMoa1eHLaAoUIAw"
const PINATA_GATEWAY = "https://gateway.pinata.cloud/ipfs/"

// NFT Contract ABI (simplified)
const NFT_CONTRACT_ABI = [
  "function mint(address to, string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function transferFrom(address from, address to, uint256 tokenId) public",
  "function approve(address to, uint256 tokenId) public",
  "function getApproved(uint256 tokenId) public view returns (address)",
  "function setApprovalForAll(address operator, bool approved) public",
  "function isApprovedForAll(address owner, address operator) public view returns (bool)",
]

// Contract addresses for different networks
const CONTRACT_ADDRESSES = {
  1: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Ethereum Mainnet
  11155111: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Sepolia Testnet
  137: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Polygon Mainnet
  80001: "0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6", // Mumbai Testnet
}

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
  80001: {
    name: "Mumbai Testnet",
    rpcUrl: "https://rpc-mumbai.maticvigil.com",
    blockExplorer: "https://mumbai.polygonscan.com",
    currency: "MATIC",
  },
}

// Upload file to IPFS via Pinata
export async function uploadToIPFS(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const metadata = JSON.stringify({
      name: file.name,
      keyvalues: {
        uploadedBy: "FlowSketch",
        timestamp: new Date().toISOString(),
      },
    })
    formData.append("pinataMetadata", metadata)

    const options = JSON.stringify({
      cidVersion: 0,
    })
    formData.append("pinataOptions", options)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pinata upload failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (error) {
    console.error("IPFS upload error:", error)
    throw new Error(`Failed to upload to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Upload JSON metadata to IPFS
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  try {
    const response = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: JSON.stringify({
        pinataContent: metadata,
        pinataMetadata: {
          name: "NFT Metadata",
          keyvalues: {
            type: "metadata",
            uploadedBy: "FlowSketch",
            timestamp: new Date().toISOString(),
          },
        },
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Pinata metadata upload failed: ${response.status} ${errorText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (error) {
    console.error("Metadata upload error:", error)
    throw new Error(`Failed to upload metadata to IPFS: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Create NFT metadata object
export function createNFTMetadata({
  title,
  description,
  artist,
  imageHash,
  attributes = [],
}: {
  title: string
  description: string
  artist: string
  imageHash: string
  attributes?: Array<{ trait_type: string; value: string | number }>
}) {
  return {
    name: title,
    description,
    image: `ipfs://${imageHash}`,
    external_url: "https://flowsketch.art",
    attributes: [
      {
        trait_type: "Artist",
        value: artist,
      },
      {
        trait_type: "Created With",
        value: "FlowSketch AI",
      },
      {
        trait_type: "Creation Date",
        value: new Date().toISOString().split("T")[0],
      },
      ...attributes,
    ],
    properties: {
      category: "Digital Art",
      creator: artist,
      platform: "FlowSketch",
    },
  }
}

// Get Web3 provider
export function getWeb3Provider() {
  if (typeof window !== "undefined" && window.ethereum) {
    return new ethers.BrowserProvider(window.ethereum)
  }
  throw new Error("No Web3 provider found. Please install MetaMask.")
}

// Get contract instance
export function getNFTContract(chainId: number, signer?: ethers.Signer) {
  const contractAddress = CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES]
  if (!contractAddress) {
    throw new Error(`Unsupported network: ${chainId}`)
  }

  const provider = signer || getWeb3Provider()
  return new ethers.Contract(contractAddress, NFT_CONTRACT_ABI, provider)
}

// Mint NFT
export async function mintNFT(tokenURI: string, price: string, chainId: number): Promise<string> {
  try {
    const provider = getWeb3Provider()
    const signer = await provider.getSigner()
    const contract = getNFTContract(chainId, signer)

    // Convert price to wei
    const priceInWei = ethers.parseEther(price)

    // Mint the NFT
    const tx = await contract.mint(await signer.getAddress(), tokenURI, {
      value: priceInWei,
      gasLimit: 300000,
    })

    console.log("Minting transaction sent:", tx.hash)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log("NFT minted successfully:", receipt.hash)

    return tx.hash
  } catch (error) {
    console.error("Minting error:", error)
    throw new Error(`Failed to mint NFT: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Purchase NFT
export async function purchaseNFT(tokenId: string, price: string, chainId: number): Promise<string> {
  try {
    const provider = getWeb3Provider()
    const signer = await provider.getSigner()

    // Convert price to wei
    const priceInWei = ethers.parseEther(price)

    // Send transaction to purchase NFT
    const tx = await signer.sendTransaction({
      to: CONTRACT_ADDRESSES[chainId as keyof typeof CONTRACT_ADDRESSES],
      value: priceInWei,
      gasLimit: 200000,
    })

    console.log("Purchase transaction sent:", tx.hash)

    // Wait for transaction confirmation
    const receipt = await tx.wait()
    console.log("NFT purchased successfully:", receipt?.hash)

    return tx.hash
  } catch (error) {
    console.error("Purchase error:", error)
    throw new Error(`Failed to purchase NFT: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Get NFT metadata from IPFS
export async function getNFTMetadata(tokenURI: string) {
  try {
    // Handle both ipfs:// and https:// URLs
    const url = tokenURI.startsWith("ipfs://") ? tokenURI.replace("ipfs://", PINATA_GATEWAY) : tokenURI

    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching NFT metadata:", error)
    throw error
  }
}

// Test Pinata connection
export async function testPinataConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    })

    if (response.ok) {
      const data = await response.json()
      return {
        success: true,
        message: `Connected successfully! ${data.message || "Authentication successful"}`,
      }
    } else {
      return {
        success: false,
        message: `Connection failed: ${response.status} ${response.statusText}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `Connection error: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

// Format wallet address for display
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format price for display
export function formatPrice(price: string | number, currency = "ETH"): string {
  const numPrice = typeof price === "string" ? Number.parseFloat(price) : price
  return `${numPrice.toFixed(4)} ${currency}`
}

// Get network name
export function getNetworkName(chainId: number): string {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || `Unknown Network (${chainId})`
}

// Get block explorer URL
export function getBlockExplorerUrl(chainId: number, txHash: string): string {
  const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
  return network ? `${network.blockExplorer}/tx/${txHash}` : "#"
}

// Validate Ethereum address
export function isValidAddress(address: string): boolean {
  try {
    return ethers.isAddress(address)
  } catch {
    return false
  }
}

// Convert Wei to Ether
export function weiToEther(wei: string): string {
  try {
    return ethers.formatEther(wei)
  } catch {
    return "0"
  }
}

// Convert Ether to Wei
export function etherToWei(ether: string): string {
  try {
    return ethers.parseEther(ether).toString()
  } catch {
    return "0"
  }
}

// -----------------------------------------------------------------------------
// Compatibility helpers (used by existing components)
// -----------------------------------------------------------------------------

/**
 * Format an ETH amount to a fixed-decimal string (default 4 decimals).
 */
export function formatEthAmount(amount: string | number, decimals = 4): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  return Number.isFinite(num) ? num.toFixed(decimals) : "0.0000"
}

/**
 * Convert Ether → Wei (bigint).
 * Wrapper kept for backward compatibility with older components.
 */
export function ethToWei(eth: string): bigint {
  return ethers.parseEther(eth)
}

/**
 * Convert Wei (hex / string / bigint) → Ether (string).
 * Wrapper kept for backward compatibility with older components.
 */
export function weiToEth(wei: string | bigint): string {
  try {
    // ethers.formatEther accepts bigint or hex-string
    return ethers.formatEther(wei as any)
  } catch {
    return "0"
  }
}
