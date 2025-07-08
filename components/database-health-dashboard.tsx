"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Database, Shield, Zap, BarChart3 } from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult, type HealthScore } from "@/lib/database-health-checker"

export function DatabaseHealthDashboard() {
  const [results, setResults] = useState<HealthCheckResult[]>([])
  const [score, setScore] = useState<HealthScore | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoFixing, setAutoFixing] = useState(false)
  const [fixResults, setFixResults] = useState<any>(null)

  const runHealthCheck = async () => {
    setLoading(true)
    try {
      const { results, score } = await runDatabaseHealthCheck(false)
      setResults(results)
      setScore(score)
    } catch (error) {
      console.error("Health check failed:", error)
    } finally {
      setLoading(false)
    }
  }

  const runAutoFix = async () => {
    setAutoFixing(true)
    try {
      const { results, score, fixResults } = await runDatabaseHealthCheck(true)
      setResults(results)
      setScore(score)
      setFixResults(fixResults)
    } catch (error) {
      console.error("Auto-fix failed:", error)
    } finally {
      setAutoFixing(false)
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "Structure":
        return <Database className="h-4 w-4" />
      case "Data":
        return <BarChart3 className="h-4 w-4" />
      case "Performance":
        return <Zap className="h-4 w-4" />
      case "Security":
        return <Shield className="h-4 w-4" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const groupedResults = results.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, HealthCheckResult[]>,
  )

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Database Health Dashboard</h1>
          <p className="text-muted-foreground">Monitor and maintain your database health</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={runHealthCheck} disabled={loading} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
            Scan
          </Button>
          <Button onClick={runAutoFix} disabled={autoFixing || results.length === 0}>
            <CheckCircle className={`h-4 w-4 mr-2 ${autoFixing ? "animate-spin" : ""}`} />
            Auto-fix Issues
          </Button>
        </div>
      </div>

      {/* Health Score Overview */}
      {score && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.overall}%</div>
              <Progress value={score.overall} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Structure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.categories.structure}%</div>
              <Progress value={score.categories.structure} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.categories.data}%</div>
              <Progress value={score.categories.data} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.categories.performance}%</div>
              <Progress value={score.categories.performance} className="mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{score.categories.security}%</div>
              <Progress value={score.categories.security} className="mt-2" />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Fix Results */}
      {fixResults && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Auto-fix completed: {fixResults.fixed} issues fixed, {fixResults.failed} failed.
            {fixResults.results.length > 0 && (
              <details className="mt-2">
                <summary className="cursor-pointer">View details</summary>
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

      {/* Issues by Category */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Issues ({results.length})</TabsTrigger>
          {Object.entries(groupedResults).map(([category, issues]) => (
            <TabsTrigger key={category} value={category}>
              {category} ({issues.length})
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center py-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold">All Good!</h3>
                  <p className="text-muted-foreground">No database issues detected.</p>
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
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(result.severity)}>{result.severity}</Badge>
                      <Badge variant="outline" className="flex items-center gap-1">
                        {getCategoryIcon(result.category)}
                        {result.category}
                      </Badge>
                      {result.fixable && <Badge variant="secondary">Auto-fixable</Badge>}
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                {result.sqlFix && (
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">View SQL Fix</summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-sm overflow-x-auto">{result.sqlFix}</pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </TabsContent>

        {Object.entries(groupedResults).map(([category, issues]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            {issues.map((result, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getSeverityIcon(result.severity)}
                      {result.issue}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(result.severity)}>{result.severity}</Badge>
                      {result.fixable && <Badge variant="secondary">Auto-fixable</Badge>}
                    </div>
                  </div>
                  <CardDescription>{result.description}</CardDescription>
                </CardHeader>
                {result.sqlFix && (
                  <CardContent>
                    <details>
                      <summary className="cursor-pointer text-sm font-medium">View SQL Fix</summary>
                      <pre className="mt-2 p-3 bg-muted rounded text-sm overflow-x-auto">{result.sqlFix}</pre>
                    </details>
                  </CardContent>
                )}
              </Card>
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
