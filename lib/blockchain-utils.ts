import { supabase } from "./supabase"

// IPFS Upload Functions
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
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
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

export async function uploadMetadataToPinata(metadata: any): Promise<string> {
  try {
    const pinataResponse = await fetch("https://api.pinata.cloud/pinning/pinJSONToIPFS", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
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

// NFT Metadata Creation
export function createNFTMetadata(artwork: any): any {
  return {
    name: artwork.title,
    description: `A generative art piece created using ${artwork.dataset} dataset with ${artwork.colorScheme} color scheme.`,
    image: artwork.ipfs_url,
    attributes: [
      {
        trait_type: "Dataset",
        value: artwork.dataset,
      },
      {
        trait_type: "Color Scheme",
        value: artwork.colorScheme,
      },
      {
        trait_type: "Generation Mode",
        value: artwork.generationMode,
      },
      {
        trait_type: "Seed",
        value: artwork.seed,
      },
    ],
  }
}

// Blockchain Transaction Functions
export async function mintNFT(artworkId: string, walletAddress: string): Promise<string> {
  try {
    // This would interact with your smart contract
    // For now, return a mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Log transaction to database
    await logTransactionToSupabase({
      artwork_id: artworkId,
      wallet_address: walletAddress,
      transaction_hash: mockTxHash,
      transaction_type: "mint",
      status: "completed",
    })

    return mockTxHash
  } catch (error) {
    console.error("Error minting NFT:", error)
    throw error
  }
}

export async function purchaseArtwork(artworkId: string, walletAddress: string, priceInEth: number): Promise<string> {
  try {
    // This would interact with your smart contract
    // For now, return a mock transaction hash
    const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`

    // Log transaction to database
    await logTransactionToSupabase({
      artwork_id: artworkId,
      wallet_address: walletAddress,
      transaction_hash: mockTxHash,
      transaction_type: "purchase",
      amount_eth: priceInEth,
      status: "completed",
    })

    return mockTxHash
  } catch (error) {
    console.error("Error purchasing artwork:", error)
    throw error
  }
}

// Database Logging Functions
export async function logTransactionToSupabase(transaction: any): Promise<void> {
  try {
    const { error } = await supabase.from("blockchain_transactions").insert([transaction])

    if (error) {
      throw error
    }
  } catch (error) {
    console.error("Error logging transaction to Supabase:", error)
    throw error
  }
}

// Utility Functions
export function formatEthAmount(amount: number): string {
  return `${amount.toFixed(4)} ETH`
}

export function shortenAddress(address: string): string {
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Test Pinata Connection
export async function testPinataConnection(): Promise<boolean> {
  try {
    const response = await fetch("https://api.pinata.cloud/data/testAuthentication", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_API_KEY}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Pinata connection test failed:", error)
    return false
  }
}

// Export aliases for compatibility
export const uploadToIPFS = uploadImageToPinata
export const uploadMetadataToIPFS = uploadMetadataToPinata
