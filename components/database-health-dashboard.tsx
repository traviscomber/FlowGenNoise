"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Shield, Zap, Info } from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult, type DatabaseIssue } from "@/lib/database-health-checker"

export function DatabaseHealthDashboard() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)

  const runHealthCheck = async (autoFix = false) => {
    setIsLoading(true)
    if (autoFix) setIsAutoFixing(true)

    try {
      const result = await runDatabaseHealthCheck(autoFix)
      setHealthResult(result)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setIsLoading(false)
      setIsAutoFixing(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy":
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />
      case "critical":
        return <XCircle className="h-5 w-5 text-red-500" />
      default:
        return <Info className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "bg-green-500"
      case "warning":
        return "bg-yellow-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getSeverityBadge = (severity: string) => {
    const colors = {
      critical: "bg-red-100 text-red-800 border-red-200",
      high: "bg-orange-100 text-orange-800 border-orange-200",
      medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
      low: "bg-blue-100 text-blue-800 border-blue-200",
    }

    return (
      <Badge variant="outline" className={colors[severity as keyof typeof colors] || colors.low}>
        {severity.toUpperCase()}
      </Badge>
    )
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "structure":
        return <Database className="h-4 w-4" />
      case "security":
        return <Shield className="h-4 w-4" />
      case "performance":
        return <Zap className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const groupIssuesByCategory = (issues: DatabaseIssue[]) => {
    return issues.reduce(
      (acc, issue) => {
        if (!acc[issue.category]) {
          acc[issue.category] = []
        }
        acc[issue.category].push(issue)
        return acc
      },
      {} as Record<string, DatabaseIssue[]>,
    )
  }

  if (!healthResult) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Running initial health check...</span>
      </div>
    )
  }

  const groupedIssues = groupIssuesByCategory(healthResult.issues)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor and maintain your database health</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runHealthCheck(false)} disabled={isLoading} variant="outline">
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Scan Again
          </Button>
          <Button onClick={() => runHealthCheck(true)} disabled={isLoading || isAutoFixing}>
            {isAutoFixing ? (
              <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <CheckCircle className="h-4 w-4 mr-2" />
            )}
            Auto-fix Issues
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            {getStatusIcon(healthResult.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthResult.score}/100</div>
            <Progress value={healthResult.score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthResult.summary.total}</div>
            <p className="text-xs text-muted-foreground">Found in last scan</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{healthResult.summary.critical}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Checked</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{new Date(healthResult.lastChecked).toLocaleTimeString()}</div>
            <p className="text-xs text-muted-foreground">{new Date(healthResult.lastChecked).toLocaleDateString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Issues Details */}
      {healthResult.issues.length > 0 ? (
        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Issues ({healthResult.issues.length})</TabsTrigger>
            <TabsTrigger value="structure">Structure ({groupedIssues.structure?.length || 0})</TabsTrigger>
            <TabsTrigger value="data">Data ({groupedIssues.data?.length || 0})</TabsTrigger>
            <TabsTrigger value="performance">Performance ({groupedIssues.performance?.length || 0})</TabsTrigger>
            <TabsTrigger value="security">Security ({groupedIssues.security?.length || 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-4">
            {healthResult.issues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </TabsContent>

          {Object.entries(groupedIssues).map(([category, issues]) => (
            <TabsContent key={category} value={category} className="space-y-4">
              {issues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} />
              ))}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>🎉 Great! No issues found. Your database is healthy and optimized.</AlertDescription>
        </Alert>
      )}
    </div>
  )
}

function IssueCard({ issue }: { issue: DatabaseIssue }) {
  const [showSql, setShowSql] = useState(false)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              {issue.category === "structure" && <Database className="h-4 w-4" />}
              {issue.category === "security" && <Shield className="h-4 w-4" />}
              {issue.category === "performance" && <Zap className="h-4 w-4" />}
              {issue.category === "data" && <Info className="h-4 w-4" />}
              <CardTitle className="text-lg">{issue.title}</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={issue.type === "error" ? "destructive" : "secondary"}>{issue.type.toUpperCase()}</Badge>
              <Badge
                variant="outline"
                className={
                  issue.severity === "critical"
                    ? "border-red-500 text-red-700"
                    : issue.severity === "high"
                      ? "border-orange-500 text-orange-700"
                      : issue.severity === "medium"
                        ? "border-yellow-500 text-yellow-700"
                        : "border-blue-500 text-blue-700"
                }
              >
                {issue.severity.toUpperCase()}
              </Badge>
            </div>
          </div>
          {issue.autoFixable && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              Auto-fixable
            </Badge>
          )}
        </div>
        <CardDescription>{issue.description}</CardDescription>
      </CardHeader>
      {issue.fixSql && (
        <CardContent>
          <Button variant="outline" size="sm" onClick={() => setShowSql(!showSql)}>
            {showSql ? "Hide" : "Show"} SQL Fix
          </Button>
          {showSql && (
            <pre className="mt-2 p-3 bg-gray-100 rounded text-sm overflow-x-auto">
              <code>{issue.fixSql}</code>
            </pre>
          )}
        </CardContent>
      )}
    </Card>
  )
}
