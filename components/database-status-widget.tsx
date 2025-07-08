"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ExternalLink } from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult } from "@/lib/database-health-checker"
import Link from "next/link"

export function DatabaseStatusWidget() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const runQuickCheck = async () => {
    setIsLoading(true)
    try {
      const result = await runDatabaseHealthCheck(false)
      setHealthResult(result)
    } catch (error) {
      console.error("Quick health check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runQuickCheck()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <RefreshCw className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-600"
      case "warning":
        return "text-yellow-600"
      case "critical":
        return "text-red-600"
      default:
        return "text-gray-600"
    }
  }

  if (!healthResult) {
    return (
      <Card className="w-full max-w-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <RefreshCw className="h-4 w-4 animate-spin" />
            Database Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">Checking database health...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {getStatusIcon(healthResult.status)}
            Database Status
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={runQuickCheck} disabled={isLoading}>
            {isLoading ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Health Score</span>
          <span className={`text-sm font-medium ${getStatusColor(healthResult.status)}`}>{healthResult.score}/100</span>
        </div>
        <Progress value={healthResult.score} className="h-2" />

        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Issues Found</span>
          <div className="flex items-center gap-1">
            {healthResult.summary.critical > 0 && (
              <Badge variant="destructive" className="text-xs px-1">
                {healthResult.summary.critical}
              </Badge>
            )}
            {healthResult.summary.high > 0 && (
              <Badge variant="secondary" className="text-xs px-1 bg-orange-100 text-orange-800">
                {healthResult.summary.high}
              </Badge>
            )}
            {healthResult.summary.total === 0 && (
              <Badge variant="outline" className="text-xs px-1 bg-green-50 text-green-700">
                None
              </Badge>
            )}
          </div>
        </div>

        <div className="pt-2 border-t">
          <Link href="/admin/database-health">
            <Button variant="outline" size="sm" className="w-full bg-transparent">
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
          </Link>
        </div>

        <div className="text-xs text-muted-foreground">
          Last checked: {new Date(healthResult.lastChecked).toLocaleTimeString()}
        </div>
      </CardContent>
    </Card>
  )
}
