"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/marketplace-db"

type User = {
  id: string
  avatar_url?: string
  full_name?: string
} | null

const AuthContext = createContext<User>(null)

/**
 * Minimal provider that:
 *  • gracefully handles missing credentials (anonymous mode)
 *  • exposes the `user` object (or `null`) via context
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User>(null)

  useEffect(() => {
    // In anonymous mode we don't have a JWT / userId.
    // When you later add auth, replace the stub below with real logic.
    const userId = null
    ;(async () => {
      const profile = await getCurrentUser(userId)
      setUser(profile)
    })()
  }, [])

  return <AuthContext.Provider value={user}>{children}</AuthContext.Provider>
}

export function useUser() {
  return useContext(AuthContext)
}
