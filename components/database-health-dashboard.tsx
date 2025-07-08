"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RefreshCw, CheckCircle, AlertTriangle, XCircle, Wrench } from "lucide-react"
import { runDatabaseHealthCheck, type HealthReport } from "@/lib/database-health-checker"

export function DatabaseHealthDashboard() {
  const [healthReport, setHealthReport] = useState<HealthReport | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoFixing, setAutoFixing] = useState(false)

  const runHealthCheck = async (autoFix = false) => {
    setLoading(true)
    if (autoFix) setAutoFixing(true)

    try {
      const report = await runDatabaseHealthCheck(autoFix)
      setHealthReport(report)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
      setAutoFixing(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "default"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    return "text-red-600"
  }

  const renderIssuesByCategory = (category: keyof HealthReport["categories"]) => {
    if (!healthReport) return null

    const categoryIssues = healthReport.issues.filter((issue) => issue.category === category)
    const categoryData = healthReport.categories[category]

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold capitalize">{category}</h3>
          <div className="flex items-center gap-2">
            <span className={`text-2xl font-bold ${getScoreColor(categoryData.score)}`}>{categoryData.score}%</span>
            <Progress value={categoryData.score} className="w-24" />
          </div>
        </div>

        {categoryIssues.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>No issues found in this category. Everything looks good!</AlertDescription>
          </Alert>
        ) : (
          <div className="space-y-3">
            {categoryIssues.map((issue) => (
              <Card key={issue.id} className="border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      {getSeverityIcon(issue.severity)}
                      {issue.title}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                      {issue.canAutoFix && (
                        <Badge variant="outline" className="text-green-600">
                          Auto-fixable
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">{issue.description}</p>
                  {issue.fixSql && (
                    <details className="mt-2">
                      <summary className="text-sm font-medium cursor-pointer text-blue-600 hover:text-blue-800">
                        View SQL Fix
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{issue.fixSql}</pre>
                    </details>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!healthReport && loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Running database health check...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor and maintain your database health</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runHealthCheck(false)} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button onClick={() => runHealthCheck(true)} disabled={loading || autoFixing}>
            <Wrench className={`h-4 w-4 mr-2 ${autoFixing ? "animate-spin" : ""}`} />
            {autoFixing ? "Fixing..." : "Auto-fix Issues"}
          </Button>
        </div>
      </div>

      {healthReport && (
        <>
          {/* Overall Score */}
          <Card>
            <CardHeader>
              <CardTitle>Overall Health Score</CardTitle>
              <CardDescription>Last checked: {new Date(healthReport.lastChecked).toLocaleString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className={`text-6xl font-bold ${getScoreColor(healthReport.overallScore)}`}>
                  {healthReport.overallScore}%
                </div>
                <div className="flex-1">
                  <Progress value={healthReport.overallScore} className="h-4" />
                  <p className="text-sm text-muted-foreground mt-2">{healthReport.issues.length} total issues found</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Category Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(healthReport.categories).map(([category, data]) => (
              <Card key={category}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm capitalize">{category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(data.score)}`}>{data.score}%</span>
                    <Badge variant={data.issues > 0 ? "destructive" : "default"}>{data.issues} issues</Badge>
                  </div>
                  <Progress value={data.score} className="mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Issues */}
          <Tabs defaultValue="structure" className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="structure">Structure</TabsTrigger>
              <TabsTrigger value="data">Data</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            <TabsContent value="structure">{renderIssuesByCategory("structure")}</TabsContent>

            <TabsContent value="data">{renderIssuesByCategory("data")}</TabsContent>

            <TabsContent value="performance">{renderIssuesByCategory("performance")}</TabsContent>

            <TabsContent value="security">{renderIssuesByCategory("security")}</TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
