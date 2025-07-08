"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Shield, Zap, BarChart3 } from "lucide-react"
import { runDatabaseHealthCheck } from "@/lib/database-health-checker"

interface HealthCheckResult {
  category: string
  issue: string
  severity: "low" | "medium" | "high" | "critical"
  fixable: boolean
  sqlFix?: string
  description: string
}

interface HealthScore {
  overall: number
  categories: {
    structure: number
    data: number
    performance: number
    security: number
  }
}

export default function DatabaseHealthDashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<HealthCheckResult[]>([])
  const [score, setScore] = useState<HealthScore | null>(null)
  const [fixResults, setFixResults] = useState<any>(null)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const runHealthCheck = async (autoFix = false) => {
    setIsLoading(true)
    setFixResults(null)

    try {
      const { results, score, fixResults } = await runDatabaseHealthCheck(autoFix)
      setResults(results)
      setScore(score)
      setFixResults(fixResults)
      setLastChecked(new Date())
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    runHealthCheck()
  }, [])

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "high":
        return "destructive"
      case "medium":
        return "default"
      case "low":
        return "secondary"
      default:
        return "secondary"
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-500" />
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case "low":
        return <CheckCircle className="h-4 w-4 text-blue-500" />
      default:
        return <CheckCircle className="h-4 w-4 text-green-500" />
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-green-600"
    if (score >= 70) return "text-yellow-600"
    if (score >= 50) return "text-orange-600"
    return "text-red-600"
  }

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case "structure":
        return <Database className="h-5 w-5" />
      case "data":
        return <BarChart3 className="h-5 w-5" />
      case "performance":
        return <Zap className="h-5 w-5" />
      case "security":
        return <Shield className="h-5 w-5" />
      default:
        return <Database className="h-5 w-5" />
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Database Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor and maintain your database health</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runHealthCheck(false)} disabled={isLoading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Scan
          </Button>
          <Button onClick={() => runHealthCheck(true)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
            Auto-fix Issues
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      {score && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card className="md:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold mb-2">
                <span className={getScoreColor(score.overall)}>{score.overall}%</span>
              </div>
              <Progress value={score.overall} className="h-2" />
            </CardContent>
          </Card>

          {Object.entries(score.categories).map(([category, categoryScore]) => (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  {getCategoryIcon(category)}
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-bold mb-2">
                  <span className={getScoreColor(categoryScore)}>{categoryScore}%</span>
                </div>
                <Progress value={categoryScore} className="h-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Fix Results */}
      {fixResults && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Auto-fix completed: {fixResults.fixed} issues fixed, {fixResults.failed} failed
            {fixResults.results.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer font-medium">View Details</summary>
                <ul className="mt-2 space-y-1">
                  {fixResults.results.map((result: string, index: number) => (
                    <li key={index} className="text-sm">
                      {result}
                    </li>
                  ))}
                </ul>
              </details>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Issues List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Issues ({results.length})</TabsTrigger>
          <TabsTrigger value="critical">
            Critical ({results.filter((r) => r.severity === "critical").length})
          </TabsTrigger>
          <TabsTrigger value="high">High ({results.filter((r) => r.severity === "high").length})</TabsTrigger>
          <TabsTrigger value="fixable">Auto-fixable ({results.filter((r) => r.fixable).length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">Database is Healthy!</h3>
                  <p className="text-muted-foreground">No issues detected</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            results.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(result.severity)}
                      {result.issue}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getSeverityColor(result.severity)}>{result.severity}</Badge>
                      <Badge variant="outline">{result.category}</Badge>
                      {result.fixable && <Badge variant="secondary">Auto-fixable</Badge>}
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                {result.sqlFix && (
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer font-medium text-sm">View SQL Fix</summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">{result.sqlFix}</pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          {results
            .filter((r) => r.severity === "critical")
            .map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(result.severity)}
                      {result.issue}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="destructive">Critical</Badge>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="high" className="space-y-4">
          {results
            .filter((r) => r.severity === "high")
            .map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(result.severity)}
                      {result.issue}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant="destructive">High</Badge>
                      <Badge variant="outline">{result.category}</Badge>
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
        </TabsContent>

        <TabsContent value="fixable" className="space-y-4">
          {results
            .filter((r) => r.fixable)
            .map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(result.severity)}
                      {result.issue}
                    </CardTitle>
                    <div className="flex gap-2">
                      <Badge variant={getSeverityColor(result.severity)}>{result.severity}</Badge>
                      <Badge variant="secondary">Auto-fixable</Badge>
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                {result.sqlFix && (
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer font-medium text-sm">View SQL Fix</summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-x-auto">{result.sqlFix}</pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))}
        </TabsContent>
      </Tabs>

      {lastChecked && (
        <div className="text-center text-sm text-muted-foreground">Last checked: {lastChecked.toLocaleString()}</div>
      )}
    </div>
  )
}
