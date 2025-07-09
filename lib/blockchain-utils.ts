import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabase = createClient(
  "https://ngtfnkcszgnmpddfgdst.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5ndGZua2NzemdubXBkZGZnZHN0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE4OTUzNTcsImV4cCI6MjA2NzQ3MTM1N30.Gg-hbKTbSo_M1cUVkwz2gqp1tyyFtqp5UBTG_WI-8bg",
)

// Format Ethereum address for display
export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Format ETH amount for display
export function formatEthAmount(amount: string | number): string {
  const num = typeof amount === "string" ? Number.parseFloat(amount) : amount
  if (isNaN(num)) return "0"
  return num.toFixed(4)
}

// Upload image to Pinata IPFS
export async function uploadImageToPinata(imageData: string): Promise<string> {
  try {
    // Convert data URL to blob
    const response = await fetch(imageData)
    const blob = await response.blob()

    const formData = new FormData()
    formData.append("file", blob, "artwork.png")

    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
      method: "POST",
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
      },
      body: formData,
    })

    if (!pinataResponse.ok) {
      throw new Error("Failed to upload to Pinata")
    }

    const result = await pinataResponse.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error("Error uploading to Pinata:", error)
    throw error
  }
}

// Upload metadata to Pinata IPFS
export async function uploadMetadataToPinata(metadata: any): Promise<string> {
  try {
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
      },
      body: JSON.stringify(metadata),
    })

    if (!pinataResponse.ok) {
      throw new Error("Failed to upload metadata to Pinata")
    }

    const result = await pinataResponse.json()
    return `https://gateway.pinata.cloud/ipfs/${result.IpfsHash}`
  } catch (error) {
    console.error("Error uploading metadata to Pinata:", error)
    throw error
  }
}

// Create NFT metadata
export function createNFTMetadata(name: string, description: string, imageUrl: string, attributes: any[] = []) {
  return {
    name,
    description,
    image: imageUrl,
    attributes,
    external_url: "https://flowsketch.art",
    background_color: "000000",
  }
}

// Test Pinata connection
export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        pinata_api_key: process.env.NEXT_PUBLIC_PINATA_API_KEY || "",
        pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET_KEY || "",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Pinata connection test failed:", error)
    return false
  }
}

// Log transaction to Supabase
export async function logTransactionToSupabase(transactionData: any): Promise<void> {
  try {
    const { error } = await supabase.from("blockchain_transactions").insert([transactionData])

    if (error) {
      console.error("Error logging transaction:", error)
      throw error
    }
  } catch (error) {
    console.error("Failed to log transaction to Supabase:", error)
    throw error
  }
}

// Mint NFT (placeholder - replace with actual contract interaction)
export async function mintNFT(walletAddress: string, tokenURI: string, price: string): Promise<string> {
  try {
    // This is a placeholder - replace with actual Web3 contract interaction
    console.log("Minting NFT:", { walletAddress, tokenURI, price })

    // Simulate transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Log to Supabase
    await logTransactionToSupabase({
      wallet_address: walletAddress,
      transaction_hash: txHash,
      transaction_type: "mint",
      token_uri: tokenURI,
      price: Number.parseFloat(price),
      status: "completed",
      created_at: new Date().toISOString(),
    })

    return txHash
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

// Purchase NFT (placeholder - replace with actual contract interaction)
export async function purchaseNFT(walletAddress: string, tokenId: string, price: string): Promise<string> {
  try {
    // This is a placeholder - replace with actual Web3 contract interaction
    console.log("Purchasing NFT:", { walletAddress, tokenId, price })

    // Simulate transaction hash
    const txHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Log to Supabase
    await logTransactionToSupabase({
      wallet_address: walletAddress,
      transaction_hash: txHash,
      transaction_type: "purchase",
      token_id: tokenId,
      price: Number.parseFloat(price),
      status: "completed",
      created_at: new Date().toISOString(),
    })

    return txHash
  } catch (error) {
    console.error("Error purchasing NFT:", error)
    throw error
  }
}

// Aliases for backward compatibility
export const uploadToIPFS = uploadImageToPinata
export const uploadMetadataToIPFS = uploadMetadataToPinata
