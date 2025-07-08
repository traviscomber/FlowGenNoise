"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testPinataConnection, getPinataUsage, isPinataConfigured } from "@/lib/blockchain-utils"
import { CheckCircle, XCircle, Loader2, Cloud, Database } from "lucide-react"

export function PinataTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<boolean | null>(null)
  const [usage, setUsage] = useState<any>(null)
  const [error, setError] = useState<string>("")

  const testConnection = async () => {
    setIsLoading(true)
    setError("")

    try {
      // Test connection
      const connected = await testPinataConnection()
      setConnectionStatus(connected)

      if (connected) {
        // Get usage stats
        const usageData = await getPinataUsage()
        setUsage(usageData)
      }
    } catch (err: any) {
      setError(err.message)
      setConnectionStatus(false)
    } finally {
      setIsLoading(false)
    }
  }

  const configured = isPinataConfigured()

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Pinata IPFS Test
        </CardTitle>
        <CardDescription>Test your Pinata API configuration for IPFS storage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Configuration:</span>
          <Badge variant={configured ? "default" : "destructive"}>{configured ? "Configured" : "Missing Keys"}</Badge>
        </div>

        {!configured && (
          <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-lg border border-yellow-200">
            <p className="font-medium text-yellow-800 mb-1">Missing Configuration</p>
            <p className="text-yellow-700">
              Please add NEXT_PUBLIC_PINATA_API_KEY and NEXT_PUBLIC_PINATA_SECRET_KEY to your environment variables.
            </p>
          </div>
        )}

        <Button onClick={testConnection} disabled={!configured || isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Database className="w-4 h-4 mr-2" />
              Test Connection
            </>
          )}
        </Button>

        {connectionStatus !== null && (
          <div className="flex items-center gap-2">
            {connectionStatus ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm text-green-700">Connection successful!</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-red-500" />
                <span className="text-sm text-red-700">Connection failed</span>
              </>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
            <p className="font-medium mb-1">Error:</p>
            <p>{error}</p>
          </div>
        )}

        {usage && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Usage Statistics:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Pin Count</div>
                <div>{usage.pin_count || 0}</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="font-medium">Total Size</div>
                <div>{usage.pin_size_total ? `${(usage.pin_size_total / 1024 / 1024).toFixed(2)} MB` : "0 MB"}</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
