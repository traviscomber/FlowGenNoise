"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, AlertTriangle, CheckCircle, ExternalLink } from "lucide-react"
import { runDatabaseHealthCheck, type HealthReport } from "@/lib/database-health-checker"
import Link from "next/link"

interface DatabaseStatusWidgetProps {
  autoRefresh?: boolean
  refreshInterval?: number
}

export function DatabaseStatusWidget({
  autoRefresh = true,
  refreshInterval = 300000, // 5 minutes
}: DatabaseStatusWidgetProps) {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const report = await runDatabaseHealthCheck(false)
      setHealthReport(report)
      setLastRefresh(new Date())
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(runHealthCheck, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [autoRefresh, refreshInterval])

  const getStatusColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const getStatusIcon = (score: number) => {
    if (score >= 90) return <CheckCircle className="h-4 w-4 text-green-600" />
    return <AlertTriangle className="h-4 w-4 text-yellow-600" />
  }

  const totalIssues = healthReport?.issues.length || 0
  const criticalIssues = healthReport?.issues.filter((i) => i.severity === "high").length || 0

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Database Health</CardTitle>
          <Button variant="ghost" size="sm" onClick={runHealthCheck} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {healthReport ? (
          <>
            {/* Overall Score */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getStatusIcon(healthReport.overallScore)}
                <span className="font-medium">Overall Health</span>
              </div>
              <span className={`text-xl font-bold ${getStatusColor(healthReport.overallScore)}`}>
                {healthReport.overallScore}%
              </span>
            </div>

            <Progress value={healthReport.overallScore} className="h-2" />

            {/* Issue Summary */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Issues Found</span>
              <div className="flex gap-2">
                {criticalIssues > 0 && (
                  <Badge variant="destructive" className="text-xs">
                    {criticalIssues} critical
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {totalIssues} total
                </Badge>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(healthReport.categories).map(([category, data]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="capitalize text-muted-foreground">{category}</span>
                  <span className={getStatusColor(data.score)}>{data.score}%</span>
                </div>
              ))}
            </div>

            {/* Last Updated */}
            {lastRefresh && (
              <div className="text-xs text-muted-foreground">Last updated: {lastRefresh.toLocaleTimeString()}</div>
            )}

            {/* Action Button */}
            <Link href="/admin/database-health">
              <Button variant="outline" size="sm" className="w-full bg-transparent">
                <ExternalLink className="h-3 w-3 mr-2" />
                View Full Dashboard
              </Button>
            </Link>
          </>
        ) : (
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2 text-sm">Loading health status...</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
