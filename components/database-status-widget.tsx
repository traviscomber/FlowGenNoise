"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database } from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult } from "@/lib/database-health-checker"

export default function DatabaseStatusWidget() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkHealth()
    // Check health every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const checkHealth = async () => {
    try {
      setLoading(true)
      const result = await runDatabaseHealthCheck()
      setHealthResult(result)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-400"
      case "warning":
        return "text-yellow-400"
      case "critical":
        return "text-red-400"
      default:
        return "text-gray-400"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return CheckCircle
      case "warning":
        return AlertTriangle
      case "critical":
        return XCircle
      default:
        return Database
    }
  }

  if (!healthResult && !loading) {
    return (
      <Card className="bg-gray-900/50 border-gray-800">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Database className="w-5 h-5 text-gray-400" />
              <span className="text-sm font-medium">Database Status</span>
            </div>
            <Button size="sm" onClick={checkHealth} variant="outline" className="border-gray-700 bg-transparent">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-400" />
            <span className="text-sm font-medium">Database Health</span>
          </div>
          <Button
            size="sm"
            onClick={checkHealth}
            disabled={loading}
            variant="outline"
            className="border-gray-700 bg-transparent"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>

        {healthResult && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {(() => {
                  const StatusIcon = getStatusIcon(healthResult.status)
                  return <StatusIcon className={`w-4 h-4 ${getStatusColor(healthResult.status)}`} />
                })()}
                <span className={`text-sm font-medium capitalize ${getStatusColor(healthResult.status)}`}>
                  {healthResult.status}
                </span>
              </div>
              <Badge variant="secondary" className="text-xs">
                {healthResult.score}/100
              </Badge>
            </div>

            {healthResult.summary.total > 0 && (
              <div className="flex items-center space-x-2 text-xs">
                <span className="text-gray-400">Issues:</span>
                {healthResult.summary.critical > 0 && (
                  <Badge className="bg-red-500 text-white text-xs px-1 py-0">
                    {healthResult.summary.critical} Critical
                  </Badge>
                )}
                {healthResult.summary.high > 0 && (
                  <Badge className="bg-orange-500 text-white text-xs px-1 py-0">{healthResult.summary.high} High</Badge>
                )}
                {healthResult.summary.medium > 0 && (
                  <Badge className="bg-yellow-500 text-white text-xs px-1 py-0">
                    {healthResult.summary.medium} Medium
                  </Badge>
                )}
              </div>
            )}

            <div className="text-xs text-gray-500">
              Last checked: {new Date(healthResult.lastChecked).toLocaleTimeString()}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
