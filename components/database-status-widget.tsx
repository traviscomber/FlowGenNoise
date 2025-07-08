"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, ExternalLink } from "lucide-react"
import { runDatabaseHealthCheck, type HealthScore } from "@/lib/database-health-checker"
import Link from "next/link"

export function DatabaseStatusWidget() {
  const [score, setScore] = useState<HealthScore | null>(null)
  const [issueCount, setIssueCount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [lastCheck, setLastCheck] = useState<Date | null>(null)

  const checkHealth = async () => {
    setLoading(true)
    try {
      const { results, score } = await runDatabaseHealthCheck(false)
      setScore(score)
      setIssueCount(results.length)
      setLastCheck(new Date())
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkHealth()
    // Auto-refresh every 5 minutes
    const interval = setInterval(checkHealth, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const getHealthStatus = () => {
    if (!score) return { status: "unknown", color: "secondary", icon: RefreshCw }

    if (score.overall >= 90) {
      return { status: "excellent", color: "default", icon: CheckCircle }
    } else if (score.overall >= 70) {
      return { status: "good", color: "secondary", icon: CheckCircle }
    } else if (score.overall >= 50) {
      return { status: "warning", color: "default", icon: AlertTriangle }
    } else {
      return { status: "critical", color: "destructive", icon: XCircle }
    }
  }

  const { status, color, icon: StatusIcon } = getHealthStatus()

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Database Health</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={checkHealth} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/admin/database-health">
            <Button variant="ghost" size="sm">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <StatusIcon className="h-5 w-5" />
            <div>
              <div className="text-2xl font-bold">{score ? `${score.overall}%` : "--"}</div>
              <p className="text-xs text-muted-foreground">{issueCount} issues found</p>
            </div>
          </div>
          <Badge variant={color as any} className="capitalize">
            {status}
          </Badge>
        </div>

        {score && (
          <div className="mt-4">
            <Progress value={score.overall} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>Structure: {score.categories.structure}%</span>
              <span>Security: {score.categories.security}%</span>
            </div>
          </div>
        )}

        {lastCheck && (
          <p className="text-xs text-muted-foreground mt-2">Last check: {lastCheck.toLocaleTimeString()}</p>
        )}
      </CardContent>
    </Card>
  )
}
