"use client"

import { useEffect } from "react"

import { useState } from "react"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock } from "lucide-react"

interface PasswordGateProps {
  children: React.ReactNode
}

export function PasswordGate({ children }: PasswordGateProps) {
  const [password, setPassword] = useState("")
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isChecking, setIsChecking] = useState(true)

  // Check if user is already authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const authStatus = localStorage.getItem("flowsketch_auth")
      const authTime = localStorage.getItem("flowsketch_auth_time")

      if (authStatus === "authenticated" && authTime) {
        const authTimestamp = Number.parseInt(authTime)
        const now = Date.now()
        const oneDay = 24 * 60 * 60 * 1000 // 24 hours in milliseconds

        // Check if authentication is still valid (within 24 hours)
        if (now - authTimestamp < oneDay) {
          setIsAuthenticated(true)
        } else {
          // Clear expired authentication
          localStorage.removeItem("flowsketch_auth")
          localStorage.removeItem("flowsketch_auth_time")
        }
      }
      setIsChecking(false)
    }

    checkAuth()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Simple password check - you can change this password
      const correctPassword = "flowsketch2024" // Change this to your desired password

      if (password === correctPassword) {
        // Store authentication in localStorage
        localStorage.setItem("flowsketch_auth", "authenticated")
        localStorage.setItem("flowsketch_auth_time", Date.now().toString())
        setIsAuthenticated(true)
      } else {
        setError("Incorrect password. Please try again.")
      }
    } catch (err) {
      setError("An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("flowsketch_auth")
    localStorage.removeItem("flowsketch_auth_time")
    setIsAuthenticated(false)
    setPassword("")
  }

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Show password form if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
              <Lock className="h-6 w-6 text-white" />
            </div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FlowSketch Access
            </CardTitle>
            <CardDescription>Enter the password to access the art generator</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pr-10"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Checking...
                  </div>
                ) : (
                  "Access FlowSketch"
                )}
              </Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Authentication expires after 24 hours</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Show the app with logout option if authenticated
  return (
    <div>
      {/* Logout button in top-right corner */}
      <div className="fixed top-4 right-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="bg-white/80 backdrop-blur-sm hover:bg-white/90"
        >
          Logout
        </Button>
      </div>
      {children}
    </div>
  )
}
