"use client"

import type React from "react"
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react"
import { ethers } from "ethers"
import { useToast } from "@/hooks/use-toast"

/* -------------------------------------------------------------------------- */
/*                              Types / Helpers                               */
/* -------------------------------------------------------------------------- */

type Web3ContextValue = {
  /* environment */
  hasProvider: boolean
  /* connection state */
  isConnected: boolean
  isLoading: boolean
  account: string | null
  chainId: number | null
  balance: string | null
  /* actions */
  connect: () => Promise<void>
  disconnect: () => void
  switchNetwork: (targetChainId: number) => Promise<void>
}

const Web3Context = createContext<Web3ContextValue | undefined>(undefined)

/* -------------------------------------------------------------------------- */
/*                          Provider implementation                           */
/* -------------------------------------------------------------------------- */

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast()
  const hasProvider = useMemo(() => typeof window !== "undefined" && Boolean((window as any).ethereum), [])

  const [account, setAccount] = useState<string | null>(null)
  const [chainId, setChainId] = useState<number | null>(null)
  const [balance, setBalance] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /* ---------------------------------------------------------------------- */
  /*                                helpers                                 */
  /* ---------------------------------------------------------------------- */

  const refreshBalance = useCallback(
    async (acct: string) => {
      try {
        const provider = new ethers.BrowserProvider((window as any).ethereum as any)
        const rawBal = await provider.getBalance(acct)
        setBalance(ethers.formatEther(rawBal))
      } catch {
        setBalance(null)
      }
    },
    [setBalance],
  )

  /* ---------------------------------------------------------------------- */
  /*                                actions                                 */
  /* ---------------------------------------------------------------------- */

  const connect = useCallback(async () => {
    if (!hasProvider) return
    try {
      setIsLoading(true)
      const provider = new ethers.BrowserProvider((window as any).ethereum as any)
      const accounts = await provider.send("eth_requestAccounts", [])
      if (accounts.length === 0) throw new Error("No accounts returned")
      const acct = accounts[0] as string
      setAccount(acct)
      const { chainId } = await provider.getNetwork()
      setChainId(Number(chainId))
      await refreshBalance(acct)
    } catch (err) {
      toast({
        title: "Connection error",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [hasProvider, refreshBalance, toast])

  const disconnect = useCallback(() => {
    setAccount(null)
    setChainId(null)
    setBalance(null)
  }, [])

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!hasProvider) return
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        })
        setChainId(targetChainId)
      } catch (err) {
        toast({
          title: "Network switch failed",
          description: err instanceof Error ? err.message : "Could not switch network",
          variant: "destructive",
        })
      }
    },
    [hasProvider, toast],
  )

  /* ---------------------------------------------------------------------- */
  /*                          event listeners setup                         */
  /* ---------------------------------------------------------------------- */

  useEffect(() => {
    if (!hasProvider) return

    const { ethereum } = window as any

    const handleAccountsChanged = (accounts: string[]) => {
      if (accounts.length === 0) disconnect()
      else {
        setAccount(accounts[0])
        refreshBalance(accounts[0])
      }
    }

    const handleChainChanged = (hexChainId: string) => {
      setChainId(Number.parseInt(hexChainId, 16))
      /* Optional: reload the page so the dApp re-initialises */
      // window.location.reload()
    }

    ethereum.on("accountsChanged", handleAccountsChanged)
    ethereum.on("chainChanged", handleChainChanged)

    return () => {
      ethereum.removeListener("accountsChanged", handleAccountsChanged)
      ethereum.removeListener("chainChanged", handleChainChanged)
    }
  }, [hasProvider, disconnect, refreshBalance])

  /* ---------------------------------------------------------------------- */
  /*                              context value                             */
  /* ---------------------------------------------------------------------- */

  const value = useMemo<Web3ContextValue>(
    () => ({
      hasProvider,
      isConnected: Boolean(account),
      isLoading,
      account,
      chainId,
      balance,
      connect,
      disconnect,
      switchNetwork,
    }),
    [hasProvider, isLoading, account, chainId, balance, connect, disconnect, switchNetwork],
  )

  return <Web3Context.Provider value={value}>{children}</Web3Context.Provider>
}

/* -------------------------------------------------------------------------- */
/*                               useWeb3 hook                                 */
/* -------------------------------------------------------------------------- */
export function useWeb3() {
  const ctx = useContext(Web3Context)
  if (!ctx) {
    throw new Error("useWeb3 must be used within a Web3Provider")
  }
  return ctx
}
