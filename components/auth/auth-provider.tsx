"use client"

import { type ReactNode, createContext, useContext, useEffect, useState } from "react"
import { getCurrentUser } from "@/lib/marketplace-db"

// ---------- Context ---------- //
export interface User {
  id: string
  email?: string
  avatar_url?: string
}

interface AuthContextShape {
  user: User | null
  loading: boolean
}

const AuthContext = createContext<AuthContextShape>({
  user: null,
  loading: true,
})

export function useAuth() {
  return useContext(AuthContext)
}

// ---------- Provider ---------- //
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    /**
     * In the “anonymous” build, there is **no JWT**. We still call the helper
     * so a single code-path works for both authenticated and unauthenticated
     * deployments. The helper now gracefully resolves to `null`.
     */
    ;(async () => {
      try {
        // In a real setup you’d read the token from cookies / localStorage.
        const token = undefined
        const current = await getCurrentUser(token)
        setUser(current)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}
