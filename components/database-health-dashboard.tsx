"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Database,
  Shield,
  Zap,
  Settings,
  Play,
  Clock,
  TrendingUp,
} from "lucide-react"
import { runDatabaseHealthCheck, type HealthCheckResult, type DatabaseIssue } from "@/lib/database-health-checker"
import { useToast } from "@/hooks/use-toast"

const severityColors = {
  critical: "bg-red-500",
  high: "bg-orange-500",
  medium: "bg-yellow-500",
  low: "bg-blue-500",
}

const categoryIcons = {
  structure: Database,
  data: Settings,
  performance: Zap,
  security: Shield,
}

export default function DatabaseHealthDashboard() {
  const [healthResult, setHealthResult] = useState<HealthCheckResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [autoFixing, setAutoFixing] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const { toast } = useToast()

  useEffect(() => {
    runHealthCheck()
  }, [])

  const runHealthCheck = async (autoFix = false) => {
    try {
      setLoading(true)
      if (autoFix) setAutoFixing(true)

      const result = await runDatabaseHealthCheck(autoFix)
      setHealthResult(result)

      if (autoFix) {
        toast({
          title: "Auto-fix completed",
          description: `Fixed ${result.issues.filter((i) => i.autoFixable).length} issues automatically`,
        })
      }
    } catch (error) {
      console.error("Health check failed:", error)
      toast({
        title: "Health check failed",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setAutoFixing(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-green-500"
      case "warning":
        return "text-yellow-500"
      case "critical":
        return "text-red-500"
      default:
        return "text-gray-500"
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

  const filteredIssues =
    healthResult?.issues.filter((issue) => selectedCategory === "all" || issue.category === selectedCategory) || []

  const groupedIssues = filteredIssues.reduce(
    (acc, issue) => {
      if (!acc[issue.category]) acc[issue.category] = []
      acc[issue.category].push(issue)
      return acc
    },
    {} as Record<string, DatabaseIssue[]>,
  )

  if (!healthResult && !loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
        <div className="max-w-4xl mx-auto text-center">
          <Database className="w-16 h-16 mx-auto mb-4 text-blue-400" />
          <h1 className="text-3xl font-bold mb-4">Database Health Dashboard</h1>
          <p className="text-gray-400 mb-8">Monitor and maintain your database health</p>
          <Button onClick={() => runHealthCheck()} className="bg-blue-600 hover:bg-blue-700">
            <Database className="w-4 h-4 mr-2" />
            Run Health Check
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Database Health Dashboard</h1>
            <p className="text-gray-400">Monitor and maintain your FlowSketch database</p>
          </div>
          <div className="flex space-x-4">
            <Button
              onClick={() => runHealthCheck()}
              disabled={loading}
              variant="outline"
              className="border-gray-700 hover:bg-gray-800"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              {loading ? "Checking..." : "Refresh"}
            </Button>
            <Button
              onClick={() => runHealthCheck(true)}
              disabled={loading || autoFixing}
              className="bg-green-600 hover:bg-green-700"
            >
              <Play className={`w-4 h-4 mr-2 ${autoFixing ? "animate-pulse" : ""}`} />
              {autoFixing ? "Auto-fixing..." : "Auto-fix Issues"}
            </Button>
          </div>
        </div>

        {healthResult && (
          <>
            {/* Status Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    {(() => {
                      const StatusIcon = getStatusIcon(healthResult.status)
                      return <StatusIcon className={`w-8 h-8 ${getStatusColor(healthResult.status)}`} />
                    })()}
                    <div>
                      <p className="text-sm text-gray-400">Overall Status</p>
                      <p className={`text-xl font-bold capitalize ${getStatusColor(healthResult.status)}`}>
                        {healthResult.status}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <TrendingUp className="w-8 h-8 text-blue-400" />
                    <div>
                      <p className="text-sm text-gray-400">Health Score</p>
                      <p className="text-xl font-bold">{healthResult.score}/100</p>
                    </div>
                  </div>
                  <Progress value={healthResult.score} className="mt-2" />
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <AlertTriangle className="w-8 h-8 text-yellow-400" />
                    <div>
                      <p className="text-sm text-gray-400">Total Issues</p>
                      <p className="text-xl font-bold">{healthResult.summary.total}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-900/50 border-gray-800">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <div>
                      <p className="text-sm text-gray-400">Last Checked</p>
                      <p className="text-sm font-medium">{new Date(healthResult.lastChecked).toLocaleString()}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Issue Summary */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Issue Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-red-400 font-bold">{healthResult.summary.critical}</span>
                    </div>
                    <p className="text-sm text-gray-400">Critical</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-400 font-bold">{healthResult.summary.high}</span>
                    </div>
                    <p className="text-sm text-gray-400">High</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-yellow-400 font-bold">{healthResult.summary.medium}</span>
                    </div>
                    <p className="text-sm text-gray-400">Medium</p>
                  </div>
                  <div className="text-center">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-blue-400 font-bold">{healthResult.summary.low}</span>
                    </div>
                    <p className="text-sm text-gray-400">Low</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Issues Detail */}
            <Card className="bg-gray-900/50 border-gray-800">
              <CardHeader>
                <CardTitle>Issues Detail</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
                  <TabsList className="bg-gray-800 mb-6">
                    <TabsTrigger value="all">All Issues</TabsTrigger>
                    <TabsTrigger value="structure">Structure</TabsTrigger>
                    <TabsTrigger value="data">Data</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="security">Security</TabsTrigger>
                  </TabsList>

                  <TabsContent value={selectedCategory} className="space-y-4">
                    {filteredIssues.length === 0 ? (
                      <div className="text-center py-8">
                        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold mb-2">No Issues Found</h3>
                        <p className="text-gray-400">
                          {selectedCategory === "all"
                            ? "Your database is healthy!"
                            : `No ${selectedCategory} issues detected.`}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {Object.entries(groupedIssues).map(([category, issues]) => (
                          <div key={category} className="space-y-3">
                            <div className="flex items-center space-x-2">
                              {(() => {
                                const CategoryIcon = categoryIcons[category as keyof typeof categoryIcons]
                                return <CategoryIcon className="w-5 h-5 text-blue-400" />
                              })()}
                              <h3 className="text-lg font-semibold capitalize">{category}</h3>
                              <Badge variant="secondary">{issues.length}</Badge>
                            </div>

                            {issues.map((issue) => (
                              <Alert key={issue.id} className="bg-gray-800/50 border-gray-700">
                                <div className="flex items-start space-x-3">
                                  <Badge className={`${severityColors[issue.severity]} text-white mt-1`}>
                                    {issue.severity}
                                  </Badge>
                                  <div className="flex-1">
                                    <h4 className="font-semibold mb-1">{issue.title}</h4>
                                    <AlertDescription className="text-gray-300 mb-2">
                                      {issue.description}
                                    </AlertDescription>

                                    {issue.fixSql && (
                                      <details className="mt-2">
                                        <summary className="cursor-pointer text-sm text-blue-400 hover:text-blue-300">
                                          View SQL Fix
                                        </summary>
                                        <pre className="mt-2 p-3 bg-gray-900 rounded text-xs overflow-x-auto">
                                          <code>{issue.fixSql}</code>
                                        </pre>
                                      </details>
                                    )}

                                    <div className="flex items-center space-x-2 mt-2">
                                      <Badge variant={issue.autoFixable ? "default" : "secondary"}>
                                        {issue.autoFixable ? "Auto-fixable" : "Manual fix required"}
                                      </Badge>
                                      <Badge variant="outline" className="border-gray-600">
                                        {issue.type}
                                      </Badge>
                                    </div>
                                  </div>
                                </div>
                              </Alert>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
