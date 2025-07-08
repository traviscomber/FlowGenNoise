"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { testPinataConnection } from "@/lib/blockchain-utils"
import { CheckCircle, XCircle, Loader2, Cloud } from "lucide-react"

export function PinataTest() {
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  const handleTest = async () => {
    setIsLoading(true)
    setResult(null)

    try {
      const testResult = await testPinataConnection()
      setResult(testResult)
    } catch (error) {
      setResult({
        success: false,
        message: `Test failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Cloud className="w-5 h-5" />
          Pinata IPFS Test
        </CardTitle>
        <CardDescription>Test the connection to Pinata IPFS service</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button onClick={handleTest} disabled={isLoading} className="w-full">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Testing Connection...
            </>
          ) : (
            <>
              <Cloud className="w-4 h-4 mr-2" />
              Test Pinata Connection
            </>
          )}
        </Button>

        {result && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <Badge variant={result.success ? "default" : "destructive"}>
                {result.success ? "Connected" : "Failed"}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{result.message}</p>
          </div>
        )}

        <div className="text-xs text-muted-foreground space-y-1">
          <p>
            <strong>Service:</strong> Pinata Cloud
          </p>
          <p>
            <strong>Purpose:</strong> IPFS storage for NFT images and metadata
          </p>
          <p>
            <strong>Status:</strong> JWT token configured
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
