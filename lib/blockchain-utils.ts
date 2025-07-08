import { ethers } from "ethers"
import { supabase } from "@/lib/supabase"

// Network configurations
export const SUPPORTED_NETWORKS = {
  1: { name: "Ethereum Mainnet", currency: "ETH", rpcUrl: "https://mainnet.infura.io/v3/" },
  137: { name: "Polygon", currency: "MATIC", rpcUrl: "https://polygon-rpc.com/" },
  11155111: { name: "Sepolia Testnet", currency: "ETH", rpcUrl: "https://sepolia.infura.io/v3/" },
  80001: { name: "Mumbai Testnet", currency: "MATIC", rpcUrl: "https://rpc-mumbai.maticvigil.com/" },
}

// Pinata configuration with your JWT token
const PINATA_JWT =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIyYjk3NGQ3MC04YjY4LTQwYWEtYjAxNi03MDZmZDVkMzgwZDIiLCJlbWFpbCI6InRyYXZpc0BudWFudS5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwicGluX3BvbGljeSI6eyJyZWdpb25zIjpbeyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJGUkExIn0seyJkZXNpcmVkUmVwbGljYXRpb25Db3VudCI6MSwiaWQiOiJOWUMxIn1dLCJ2ZXJzaW9uIjoxfSwibWZhX2VuYWJsZWQiOmZhbHNlLCJzdGF0dXMiOiJBQ1RJVkUifSwiYXV0aGVudGljYXRpb25UeXBlIjoic2NvcGVkS2V5Iiwic2NvcGVkS2V5S2V5IjoiMTZmOGE1MWQ0MmVlMDMwNTVkYjYiLCJzY29wZWRLZXlTZWNyZXQiOiI5NjBhY2E4ODczZmM0YmJlZDM1ZjI3YjExMzVlNDcwN2E4YmVhMjU4ZmE3ZGM5M2Q5OWI5YjBkMDI3Mjc2MjlkIiwiZXhwIjoxNzgzNTA4MDkzfQ.mtNbbvsudKtYDFyS1NaP0DsmlNW4CMoa1eHLaAoUIAw"

// Helper functions
export function formatEthAmount(amount: number): string {
  return Number.parseFloat(amount.toFixed(6)).toString()
}

export function ethToWei(eth: number): string {
  return ethers.parseEther(eth.toString()).toString()
}

export function weiToEth(wei: string): number {
  return Number.parseFloat(ethers.formatEther(wei))
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

/**
 * Backward-compat alias – many components import { formatAddress }.
 * It delegates to `shortenAddress` so the behaviour stays the same.
 */
export function formatAddress(address: string): string {
  return shortenAddress(address)
}

export function getNetworkName(chainId: number): string {
  return SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]?.name || "Unknown Network"
}

export function isNetworkSupported(chainId: number): boolean {
  return chainId in SUPPORTED_NETWORKS
}

// Pinata IPFS functions
export async function uploadImageToPinata(file: File): Promise<string> {
  try {
    const formData = new FormData()
    formData.append("file", file)

    const metadata = JSON.stringify({
      name: `FlowSketch-${Date.now()}`,
      keyvalues: {
        type: "artwork-image",
        timestamp: new Date().toISOString(),
      },
    })
    formData.append("pinataMetadata", metadata)

    const response = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (error) {
    console.error("Error uploading to Pinata:", error)
    throw error
  }
}

export async function uploadMetadataToPinata(metadata: any): Promise<string> {
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
          name: `FlowSketch-Metadata-${Date.now()}`,
          keyvalues: {
            type: "nft-metadata",
            timestamp: new Date().toISOString(),
          },
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Pinata metadata upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    return result.IpfsHash
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error)
    throw error
  }
}

export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${PINATA_JWT}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Pinata connection test failed:", error)
    return false
  }
}

// Web3 utility functions
export async function connectWallet(): Promise<{ address: string; chainId: number } | null> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    })

    const chainId = await window.ethereum.request({
      method: "eth_chainId",
    })

    return {
      address: accounts[0],
      chainId: Number.parseInt(chainId, 16),
    }
  } catch (error) {
    console.error("Error connecting wallet:", error)
    return null
  }
}

export async function switchNetwork(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    return false
  }

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: `0x${chainId.toString(16)}` }],
    })
    return true
  } catch (error: any) {
    // If network doesn't exist, add it
    if (error.code === 4902) {
      return await addNetwork(chainId)
    }
    console.error("Error switching network:", error)
    return false
  }
}

export async function addNetwork(chainId: number): Promise<boolean> {
  if (typeof window === "undefined" || !window.ethereum) {
    return false
  }

  const network = SUPPORTED_NETWORKS[chainId as keyof typeof SUPPORTED_NETWORKS]
  if (!network) {
    return false
  }

  try {
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: `0x${chainId.toString(16)}`,
          chainName: network.name,
          nativeCurrency: {
            name: network.currency,
            symbol: network.currency,
            decimals: 18,
          },
          rpcUrls: [network.rpcUrl],
        },
      ],
    })
    return true
  } catch (error) {
    console.error("Error adding network:", error)
    return false
  }
}

export async function getGasPrice(): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    return "0"
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const feeData = await provider.getFeeData()
    return feeData.gasPrice?.toString() || "0"
  } catch (error) {
    console.error("Error getting gas price:", error)
    return "0"
  }
}

export async function estimateGas(to: string, value: string): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    return "21000"
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()
    const gasEstimate = await provider.estimateGas({
      from: await signer.getAddress(),
      to,
      value,
    })
    return gasEstimate.toString()
  } catch (error) {
    console.error("Error estimating gas:", error)
    return "21000"
  }
}

/**
 * Persist a blockchain transaction record to the `blockchain_transactions` table.
 * Components use this for analytics & history.  Safe to call from either client
 * or server code (Supabase js-client is isomorphic).
 */
export async function logTransactionToSupabase(tx: {
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
      tx_hash: tx.txHash,
      from_address: tx.fromAddress,
      to_address: tx.toAddress,
      transaction_type: tx.transactionType,
      chain_id: tx.chainId,
      value: tx.value,
      gas_used: tx.gasUsed,
      gas_price: tx.gasPrice,
      token_id: tx.tokenId,
      status: tx.status,
      created_at: new Date().toISOString(),
    })

    if (error) {
      console.error("supabase:insert blockchain_transactions", error)
    }
  } catch (err) {
    console.error("logTransactionToSupabase", err)
  }
}

// NFT minting function
export async function mintNFT(
  artworkData: {
    title: string
    description: string
    image: string
    attributes: any[]
  },
  recipientAddress: string,
): Promise<{ tokenId: string; transactionHash: string }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed")
  }

  try {
    // Upload image to IPFS
    const imageResponse = await fetch(artworkData.image)
    const imageBlob = await imageResponse.blob()
    const imageFile = new File([imageBlob], "artwork.png", { type: "image/png" })
    const imageHash = await uploadImageToPinata(imageFile)

    // Create metadata
    const metadata = {
      name: artworkData.title,
      description: artworkData.description,
      image: `https://gateway.pinata.cloud/ipfs/${imageHash}`,
      attributes: artworkData.attributes,
    }

    // Upload metadata to IPFS
    const metadataHash = await uploadMetadataToPinata(metadata)

    // For demo purposes, we'll simulate the minting transaction
    // In a real implementation, you would deploy and interact with an actual NFT contract
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    // Simulate transaction (replace with actual contract interaction)
    const tx = await signer.sendTransaction({
      to: recipientAddress,
      value: ethers.parseEther("0.001"), // Small amount for demo
      data: "0x", // Empty data for demo
    })

    await tx.wait()

    return {
      tokenId: Date.now().toString(), // Simulated token ID
      transactionHash: tx.hash,
    }
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

// Purchase NFT function
export async function purchaseNFT(
  artworkId: string,
  price: number,
  sellerAddress: string,
): Promise<{ transactionHash: string; blockNumber: number }> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("MetaMask is not installed")
  }

  try {
    const provider = new ethers.BrowserProvider(window.ethereum)
    const signer = await provider.getSigner()

    const tx = await signer.sendTransaction({
      to: sellerAddress,
      value: ethers.parseEther(price.toString()),
    })

    const receipt = await tx.wait()

    return {
      transactionHash: tx.hash,
      blockNumber: receipt?.blockNumber || 0,
    }
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    throw error
  }
}

/* ------------------------------------------------------------------ */
/*  IPFS convenience aliases & helpers                                */
/* ------------------------------------------------------------------ */

/**
 * Alias kept for backward compatibility – older code calls `uploadToIPFS`
 * but we renamed the implementation to `uploadImageToPinata`.
 */
export const uploadToIPFS = uploadImageToPinata

/**
 * Alias for code that calls `uploadMetadataToIPFS` instead of the new name.
 */
export const uploadMetadataToIPFS = uploadMetadataToPinata

/**
 * Build the standard ERC-721 metadata JSON object used throughout FlowSketch.
 * You can pass an already-uploaded image/IPFS hash or an https URL.
 */
export function createNFTMetadata({
  title,
  description,
  image,
  attributes,
}: {
  title: string
  description: string
  image: string
  attributes?: any[]
}) {
  return {
    name: title,
    description,
    image,
    attributes: attributes ?? [],
  }
}

// Type declarations for window.ethereum
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
