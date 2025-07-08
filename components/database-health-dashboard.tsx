"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useToast } from "@/hooks/use-toast"
import {
  Database,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Wrench,
  Info,
  Activity,
  Shield,
  Zap,
} from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult, type DatabaseIssue } from "@/lib/database-health-checker"

export function DatabaseHealthDashboard() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isAutoFixing, setIsAutoFixing] = useState(false)
  const { toast } = useToast()

  const runHealthCheck = async (autoFix = false) => {
    setIsChecking(true)
    if (autoFix) setIsAutoFixing(true)

    try {
      const result = await runDatabaseHealthCheck(autoFix)
      setHealthResult(result)

      if (result.status === "healthy") {
        toast({
          title: "Database Healthy! ✅",
          description: "All systems are running smoothly",
        })
      } else if (result.summary.autoFixedIssues > 0) {
        toast({
          title: `Auto-fixed ${result.summary.autoFixedIssues} issues! 🔧`,
          description: `${result.issues.length} issues remaining`,
        })
      } else {
        toast({
          title: `Found ${result.summary.totalIssues} issues`,
          description: "Review the issues below",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Health check failed:", error)
      toast({
        title: "Health check failed",
        description: "Unable to complete database health check",
        variant: "destructive",
      })
    } finally {
      setIsChecking(false)
      setIsAutoFixing(false)
    }
  }

  const getSeverityIcon = (severity: DatabaseIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return <XCircle className="w-4 h-4 text-red-500" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />
      case "info":
        return <Info className="w-4 h-4 text-blue-500" />
    }
  }

  const getSeverityColor = (severity: DatabaseIssue["severity"]) => {
    switch (severity) {
      case "critical":
        return "destructive"
      case "warning":
        return "secondary"
      case "info":
        return "outline"
    }
  }

  const getStatusIcon = () => {
    if (!healthResult) return <Database className="w-6 h-6" />

    switch (healthResult.status) {
      case "healthy":
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case "issues_found":
        return <AlertTriangle className="w-6 h-6 text-yellow-500" />
      case "critical_errors":
        return <XCircle className="w-6 h-6 text-red-500" />
    }
  }

  const getStatusColor = () => {
    if (!healthResult) return "secondary"

    switch (healthResult.status) {
      case "healthy":
        return "default"
      case "issues_found":
        return "secondary"
      case "critical_errors":
        return "destructive"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h1 className="text-2xl font-bold">Database Health Monitor</h1>
            <p className="text-muted-foreground">Monitor and maintain your database integrity</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runHealthCheck(false)} disabled={isChecking} variant="outline">
            {isChecking ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Activity className="w-4 h-4 mr-2" />}
            Scan Database
          </Button>
          <Button onClick={() => runHealthCheck(true)} disabled={isChecking || isAutoFixing}>
            {isAutoFixing ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wrench className="w-4 h-4 mr-2" />}
            Scan & Auto-Fix
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      {healthResult && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Overall Status</p>
                  <Badge variant={getStatusColor()} className="mt-1">
                    {healthResult.status.replace("_", " ").toUpperCase()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Issues</p>
                  <p className="text-2xl font-bold">{healthResult.summary.totalIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Critical Issues</p>
                  <p className="text-2xl font-bold">{healthResult.summary.criticalIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Auto-Fixed</p>
                  <p className="text-2xl font-bold">{healthResult.summary.autoFixedIssues}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Loading State */}
      {isChecking && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
              <div className="flex-1">
                <p className="font-medium">
                  {isAutoFixing ? "Scanning database and auto-fixing issues..." : "Scanning database..."}
                </p>
                <Progress value={undefined} className="mt-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {healthResult && !isChecking && (
        <Tabs defaultValue="issues" className="space-y-4">
          <TabsList>
            <TabsTrigger value="issues">Current Issues ({healthResult.issues.length})</TabsTrigger>
            <TabsTrigger value="fixed">Fixed Issues ({healthResult.fixedIssues.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="issues" className="space-y-4">
            {healthResult.issues.length === 0 ? (
              <Alert>
                <CheckCircle className="w-4 h-4" />
                <AlertDescription>No issues found! Your database is healthy.</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {healthResult.issues.map((issue, index) => (
                    <Card key={index}>
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {getSeverityIcon(issue.severity)}
                            <CardTitle className="text-base">
                              {issue.table}
                              {issue.column && `.${issue.column}`}
                            </CardTitle>
                            <Badge variant={getSeverityColor(issue.severity)}>{issue.severity}</Badge>
                          </div>
                          {issue.autoFixable && (
                            <Badge variant="outline" className="text-green-600">
                              Auto-fixable
                            </Badge>
                          )}
                        </div>
                        <CardDescription>{issue.description}</CardDescription>
                      </CardHeader>
                      {issue.sqlFix && (
                        <CardContent className="pt-0">
                          <div className="bg-muted p-3 rounded-md">
                            <p className="text-sm font-mono text-muted-foreground">SQL Fix:</p>
                            <code className="text-sm">{issue.sqlFix}</code>
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="fixed" className="space-y-4">
            {healthResult.fixedIssues.length === 0 ? (
              <Alert>
                <Info className="w-4 h-4" />
                <AlertDescription>No issues have been auto-fixed in this session.</AlertDescription>
              </Alert>
            ) : (
              <ScrollArea className="h-[400px]">
                <div className="space-y-3">
                  {healthResult.fixedIssues.map((issue, index) => (
                    <Card key={index} className="border-green-200 bg-green-50">
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <CardTitle className="text-base">
                            {issue.table}
                            {issue.column && `.${issue.column}`}
                          </CardTitle>
                          <Badge variant="outline" className="text-green-600">
                            Fixed
                          </Badge>
                        </div>
                        <CardDescription>{issue.description}</CardDescription>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Initial State */}
      {!healthResult && !isChecking && (
        <Card>
          <CardContent className="p-8 text-center">
            <Database className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Database Health Check</h3>
            <p className="text-muted-foreground mb-4">
              Run a comprehensive scan to check your database health and automatically fix common issues.
            </p>
            <Button onClick={() => runHealthCheck(true)}>
              <Wrench className="w-4 h-4 mr-2" />
              Start Health Check
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
