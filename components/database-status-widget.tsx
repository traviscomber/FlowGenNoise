"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Database, CheckCircle, AlertTriangle, XCircle, RefreshCw, ExternalLink } from "lucide-react"
import { runDatabaseHealthCheck } from "@/lib/database-health-checker"
import Link from "next/link"

interface HealthSummary {
  score: number
  status: "healthy" | "warning" | "critical"
  totalIssues: number
  criticalIssues: number
  lastChecked: Date
}

export default function DatabaseStatusWidget() {
  const [summary, setSummary] = useState<HealthSummary | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const checkHealth = async () => {
    setIsLoading(true)
    try {
      const { results, score } = await runDatabaseHealthCheck(false)

      const criticalIssues = results.filter((r) => r.severity === "critical").length
      const highIssues = results.filter((r) => r.severity === "high").length

      let status: "healthy" | "warning" | "critical" = "healthy"
      if (criticalIssues > 0) status = "critical"
      else if (highIssues > 0 || results.length > 3) status = "warning"

      setSummary({
        score: score.overall,
        status,
        totalIssues: results.length,
        criticalIssues,
        lastChecked: new Date(),
      })
    } catch (error) {
      console.error("Health check failed:", error)
      setSummary({
        score: 0,
        status: "critical",
        totalIssues: 1,
        criticalIssues: 1,
        lastChecked: new Date(),
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // Auto-refresh every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = () => {
    if (isLoading) return <RefreshCw className="h-4 w-4 animate-spin" />

    switch (summary?.status) {
      case "healthy":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getStatusColor = () => {
    switch (summary?.status) {
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

  const getStatusBadge = () => {
    switch (summary?.status) {
      case "healthy":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Healthy
          </Badge>
        )
      case "warning":
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
            Warning
          </Badge>
        )
      case "critical":
        return <Badge variant="destructive">Critical</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm font-medium">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Database Health
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {summary && getStatusBadge()}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {summary ? (
          <>
            {/* Health Score */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Health Score</span>
                <span className={`text-lg font-bold ${getStatusColor()}`}>{summary.score}%</span>
              </div>
              <Progress value={summary.score} className="h-2" />
            </div>

            {/* Issues Summary */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <div className="text-muted-foreground">Total Issues</div>
                <div className="font-semibold">{summary.totalIssues}</div>
              </div>
              <div>
                <div className="text-muted-foreground">Critical</div>
                <div className="font-semibold text-red-600">{summary.criticalIssues}</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={checkHealth}
                disabled={isLoading}
                className="flex-1 bg-transparent"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              <Button size="sm" asChild className="flex-1">
                <Link href="/admin/database-health">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Details
                </Link>
              </Button>
            </div>

            {/* Last Checked */}
            <div className="text-xs text-muted-foreground text-center">
              Last checked: {summary.lastChecked.toLocaleTimeString()}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
            <div className="text-sm text-muted-foreground">Checking database health...</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
