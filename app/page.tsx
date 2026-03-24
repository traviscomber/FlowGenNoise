"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("generator")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <span className="text-xl">✨</span>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FlowSketch Art Generator
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Professional AI-powered art generation with advanced dome projections and seamless 360° panoramas
          </p>

          {/* Feature Badges */}
          <div className="flex flex-wrap justify-center gap-2 mt-6">
            <Badge variant="secondary" className="px-3 py-1">
              GODLEVEL Quality
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              360° VR Ready
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              ChatGPT Enhanced
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              Professional Grade
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="generator">
              Art Generator
            </TabsTrigger>
            <TabsTrigger value="planner">
              Dome & 360° Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <Card>
              <CardHeader>
                <CardTitle>Art Generation Studio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Loading Art Generator...</p>
                  <div className="animate-pulse">
                    <div className="h-12 bg-slate-200 rounded mb-4"></div>
                    <div className="h-12 bg-slate-200 rounded mb-4"></div>
                    <div className="h-40 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="planner">
            <Card>
              <CardHeader>
                <CardTitle>Dome & 360° Planner</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-muted-foreground">Loading Planner...</p>
                  <div className="animate-pulse">
                    <div className="h-12 bg-slate-200 rounded mb-4"></div>
                    <div className="h-40 bg-slate-200 rounded"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI DALL-E 3 • Enhanced with ChatGPT • Professional VR Quality
          </p>
        </div>
      </div>
    </div>
  )
}
