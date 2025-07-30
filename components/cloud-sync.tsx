"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Cloud, Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { CloudSync, type CloudSyncStatus } from "@/lib/cloud-sync"

export function CloudSyncComponent() {
  const { toast } = useToast()
  const [status, setStatus] = useState<CloudSyncStatus>(CloudSync.getStatus())
  const [showPassword, setShowPassword] = useState(false)
  const [authForm, setAuthForm] = useState({ email: "", password: "", displayName: "" })
  const [authMode, setAuthMode] = useState<"signIn" | "signUp">("signIn")
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const handleStatusChange = (newStatus: CloudSyncStatus) => {
      setStatus(newStatus)
    }

    CloudSync.addStatusListener(handleStatusChange)
    CloudSync.initializeAuth()

    return () => CloudSync.removeStatusListener(handleStatusChange)
  }, [])

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthLoading(true)

    try {
      let result
      if (authMode === "signIn") {
        result = await CloudSync.signInWithEmail(authForm.email, authForm.password)
      } else {
        result = await CloudSync.signUpWithEmail(authForm.email, authForm.password, authForm.displayName)
      }

      if (result.success) {
        toast({
          title: `Successfully ${authMode === "signIn" ? "signed in" : "signed up"}!`,
          description: "Cloud sync is now active.",
        })
        setAuthForm({ email: "", password: "", displayName: "" })
      } else {
        toast({
          title: "Authentication Failed",
          description: result.error || "Please check your credentials.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      toast({
        title: "Authentication Error",
        description: error.message || "An unexpected error occurred.",
        variant: "destructive",
      })
    } finally {
      setAuthLoading(false)
    }
  }

  const handleSignOut = async () => {
    await CloudSync.signOut()
    toast({
      title: "Signed Out",
      description: "Cloud sync has been disabled.",
    })
  }

  const handleToggleSync = async (checked: boolean) => {
    if (checked) {
      const result = await CloudSync.enableSync()
      if (result.success) {
        toast({
          title: "Cloud Sync Enabled",
          description: "Your gallery will now sync with the cloud.",
        })
      } else {
        toast({
          title: "Failed to Enable Sync",
          description: result.error || "Please try again.",
          variant: "destructive",
        })
      }
    } else {
      await CloudSync.disableSync()
      toast({
        title: "Cloud Sync Disabled",
        description: "Your gallery will no longer sync with the cloud.",
      })
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Cloud className="h-4 w-4" /> Cloud Sync
        </CardTitle>
        <Switch checked={status.isEnabled} onCheckedChange={handleToggleSync} disabled={!status.isAuthenticated} />
      </CardHeader>
      <CardContent>
        <p className="text-xs text-muted-foreground mb-4">
          {status.isAuthenticated
            ? status.isEnabled
              ? "Sync enabled. Your gallery is backed up to the cloud."
              : "Sync disabled. Enable to backup your gallery."
            : "Sign in to enable cloud sync and backup your gallery."}
        </p>

        {!status.isAuthenticated ? (
          <form onSubmit={handleAuthSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  className="pl-8"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  className="pl-8 pr-8"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            {authMode === "signUp" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Display Name (Optional)</Label>
                <Input
                  id="displayName"
                  type="text"
                  placeholder="Your Name"
                  value={authForm.displayName}
                  onChange={(e) => setAuthForm({ ...authForm, displayName: e.target.value })}
                />
              </div>
            )}
            <Button type="submit" className="w-full" disabled={authLoading}>
              {authLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : authMode === "signIn" ? (
                "Sign In"
              ) : (
                "Sign Up"
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full"
              onClick={() => setAuthMode(authMode === "signIn" ? "signUp" : "signIn")}
            >
              {authMode === "signIn" ? "Need an account? Sign Up" : "Already have an account? Sign In"}
            </Button>
          </form>
        ) : (
          <div className="space-y-4">
            <Button onClick={handleSignOut} variant="destructive" className="w-full">
              Sign Out
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
