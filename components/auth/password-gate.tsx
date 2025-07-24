"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const storedAuth = localStorage.getItem("flowsketch_auth")
    if (storedAuth === "true") {
      setIsAuthenticated(true)
    }
  }, [])

  const handleLogin = () => {
    if (password === process.env.NEXT_PUBLIC_PASSWORD_GATE_PASSWORD) {
      setIsAuthenticated(true)
      localStorage.setItem("flowsketch_auth", "true")
      setError("")
    } else {
      setError("Incorrect password")
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Access FlowSketch</CardTitle>
          <CardDescription>Enter the password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <Input
              id="password"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleLogin()
                }
              }}
            />
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button className="w-full" onClick={handleLogin}>
              Enter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
