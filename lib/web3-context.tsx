"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import { ethers } from "ethers"
import { mintNFT as mintNFTUtil, purchaseNFT as purchaseNFTUtil, SUPPORTED_NETWORKS } from "./blockchain-utils"

/* -------------------------------------------------------------------------- */
/*                               Context types                                */
/* -------------------------------------------------------------------------- */

interface Web3ContextType {
  /* Connection state ------------------------------------------------------- */
  hasProvider: boolean
  isConnected: boolean
  account: string | null
  chainId: number | null
  balance: string | null

  /* Connection helpers ----------------------------------------------------- */
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (chainId: number) => Promise<void>

  /* Transaction helpers ---------------------------------------------------- */
  mintNFT: (tokenURI: string, price: string) => Promise<string>
  purchaseNFT: (tokenId: string, price: string) => Promise<string>

  /* UI helpers ------------------------------------------------------------- */
  isLoading: boolean
  error: string | null
}

const Web3Context = createContext<Web3ContextType | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/*                               Provider                                     */
/* -------------------------------------------------------------------------- */

interface Web3ProviderProps {
  children: ReactNode
}

export function Web3Provider({ children }: Web3ProviderProps) {
  /* ----------------------------- local state ------------------------------ */
  const [hasProvider, setHasProvider] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  /* --------------------------- side-effects ------------------------------- */
  useEffect(() => {
    const hasMetaMask =
      typeof window !== "undefined" && !!(window as any).ethereum && (window as any).ethereum.isMetaMask
    setHasProvider(hasMetaMask)

    if (hasMetaMask) {
      checkConnection()

      /* --- event listeners ------------------------------------------------ */
      const { ethereum } = window as any
      ethereum.on("accountsChanged", handleAccountsChanged)
      ethereum.on("chainChanged", handleChainChanged)
      ethereum.on("disconnect", handleDisconnect)

      return () => {
        ethereum.removeListener("accountsChanged", handleAccountsChanged)
        ethereum.removeListener("chainChanged", handleChainChanged)
        ethereum.removeListener("disconnect", handleDisconnect)
      }
    }
  }, [])

  /* --------------------------- helpers ------------------------------------ */

  const checkConnection = async () => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const accounts = await provider.listAccounts()

      if (accounts.length > 0) {
        const signer = await provider.getSigner()
        const address = await signer.getAddress()
        const network = await provider.getNetwork()
        const balance = await provider.getBalance(address)

        setAccount(address)
        setChainId(Number(network.chainId))
        setBalance(ethers.formatEther(balance))
        setIsConnected(true)
      }
    } catch (err) {
      console.error("Error checking connection:", err)
    }
  }

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      disconnect()
    } else {
      setAccount(accounts[0])
      updateBalance(accounts[0])
    }
  }

  const handleChainChanged = (hexChainId: string) => {
    setChainId(Number.parseInt(hexChainId, 16))
    if (account) updateBalance(account)
  }

  const handleDisconnect = () => disconnect()

  const updateBalance = async (address: string) => {
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const balance = await provider.getBalance(address)
      setBalance(ethers.formatEther(balance))
    } catch (err) {
      console.error("Error updating balance:", err)
    }
  }

  /* --------------------------- public API --------------------------------- */

  const connect = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (!hasProvider) {
        throw new Error("MetaMask is not installed. Please install MetaMask to continue.")
      }

      await (window as any).ethereum.request({ method: "eth_requestAccounts" })

      const provider = new ethers.BrowserProvider((window as any).ethereum)
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const network = await provider.getNetwork()
      const balance = await provider.getBalance(address)

      setAccount(address)
      setChainId(Number(network.chainId))
      setBalance(ethers.formatEther(balance))
      setIsConnected(true)

      console.info("[Web3] Connected:", address)
    } catch (err: any) {
      console.error("Connection error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }, [hasProvider])

  const disconnect = () => {
    setIsConnected(false)
    setAccount(null)
    setChainId(null)
    setBalance(null)
    setError(null)
  }

  const switchNetwork = async (targetChainId: number) => {
    setIsLoading(true)
    setError(null)

    try {
      if (!hasProvider) {
        throw new Error("MetaMask is not installed")
      }

      const chainIdHex = `0x${targetChainId.toString(16)}`

      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: chainIdHex }],
        })
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          const cfg = SUPPORTED_NETWORKS[targetChainId as keyof typeof SUPPORTED_NETWORKS]
          if (cfg) {
            await (window as any).ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainId: chainIdHex,
                  chainName: cfg.name,
                  rpcUrls: [cfg.rpcUrl],
                  blockExplorerUrls: [cfg.blockExplorer],
                  nativeCurrency: {
                    name: cfg.currency,
                    symbol: cfg.currency,
                    decimals: 18,
                  },
                },
              ],
            })
          }
        } else {
          throw switchError
        }
      }

      setChainId(targetChainId)
      if (account) updateBalance(account)
    } catch (err: any) {
      console.error("Network switch error:", err)
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const mintNFT = async (tokenURI: string, price: string) => {
    if (!isConnected || !chainId) throw new Error("Wallet not connected")
    setIsLoading(true)
    setError(null)

    try {
      const txHash = await mintNFTUtil(tokenURI, price, chainId)
      if (account) setTimeout(() => updateBalance(account), 2_000)
      return txHash
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const purchaseNFT = async (tokenId: string, price: string) => {
    if (!isConnected || !chainId) throw new Error("Wallet not connected")
    setIsLoading(true)
    setError(null)

    try {
      const txHash = await purchaseNFTUtil(tokenId, price, chainId)
      if (account) setTimeout(() => updateBalance(account), 2_000)
      return txHash
    } catch (err: any) {
      setError(err.message)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  /* ----------------------------- provider value --------------------------- */

  const value: Web3ContextType = {
    hasProvider,
    isConnected,
    account,
    chainId,
    balance,
    connect,
    disconnect,
    switchNetwork,
    mintNFT,
    purchaseNFT,
    isLoading,
    error,
  }

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

/* -------------------------------------------------------------------------- */
/*                               Hook                                         */
/* -------------------------------------------------------------------------- */

export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) throw new Error("useWeb3 must be used within a Web3Provider")
  return ctx
}

/* ----------------------------- global types ------------------------------ */

declare global {
  interface Window {
    ethereum?: {
      isMetaMask?: boolean
      request: (args: { method: string; params?: any[] }) => Promise<unknown>
      on: (ev: string, cb: (...a: any[]) => void) => void
      removeListener: (ev: string, cb: (...a: any[]) => void) => void
    }
  }
}
