"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { runDatabaseHealthCheck, type HealthCheckResult } from "@/lib/database-health-checker"
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw } from "lucide-react"

interface DatabaseStatusWidgetProps {
  autoCheck?: boolean
  showDetails?: boolean
}

export function DatabaseStatusWidget({ autoCheck = false, showDetails = true }: DatabaseStatusWidgetProps) {
  const [status, setStatus] = useState<HealthCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkHealth = async () => {
    setIsChecking(true)
    try {
      const result = await runDatabaseHealthCheck(false)
      setStatus(result)
      setLastCheck(new Date())
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setIsChecking(false)
    }
  }

  useEffect(() => {
    if (autoCheck) {
      checkHealth()
    }
  }, [autoCheck])

  const getStatusIcon = () => {
    if (isChecking) return <RefreshCw className="w-4 h-4 animate-spin" />
    if (!status) return <Database className="w-4 h-4" />

    switch (status.status) {
      case "healthy":
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case "issues_found":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "critical_errors":
        return <XCircle className="w-4 h-4 text-red-500" />
    }
  }

  const getStatusColor = () => {
    if (!status) return "secondary"

    switch (status.status) {
      case "healthy":
        return "default"
      case "issues_found":
        return "secondary"
      case "critical_errors":
        return "destructive"
    }
  }

  const getStatusText = () => {
    if (isChecking) return "Checking..."
    if (!status) return "Unknown"

    switch (status.status) {
      case "healthy":
        return "Healthy"
      case "issues_found":
        return "Issues Found"
      case "critical_errors":
        return "Critical Errors"
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {getStatusIcon()}
            <div>
              <p className="font-medium">Database Status</p>
              <Badge variant={getStatusColor()}>{getStatusText()}</Badge>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={checkHealth} disabled={isChecking}>
            <RefreshCw className="w-3 h-3" />
          </Button>
        </div>

        {showDetails && status && (
          <div className="mt-4 pt-4 border-t">
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Issues</p>
                <p className="font-medium">{status.summary.totalIssues}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Critical</p>
                <p className="font-medium">{status.summary.criticalIssues}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Fixed</p>
                <p className="font-medium">{status.summary.autoFixedIssues}</p>
              </div>
            </div>
          </div>
        )}

        {lastCheck && (
          <p className="text-xs text-muted-foreground mt-2">Last checked: {lastCheck.toLocaleTimeString()}</p>
        )}
      </CardContent>
    </Card>
  )
}
