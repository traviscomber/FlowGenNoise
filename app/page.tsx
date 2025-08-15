"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlowArtGenerator from "@/components/flow-art-generator"
import { Dome360Planner } from "@/components/dome-360-planner"
import { Palette, Globe, Zap, Shield, Star, Sparkles } from "lucide-react"
import { Suspense } from "react"
import { Toaster } from "@/components/ui/toaster"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("generator")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl">
              <Sparkles className="h-8 w-8 text-white" />
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
              <Star className="h-3 w-3 mr-1" />
              GODLEVEL Quality
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Globe className="h-3 w-3 mr-1" />
              360° VR Ready
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Zap className="h-3 w-3 mr-1" />
              ChatGPT Enhanced
            </Badge>
            <Badge variant="secondary" className="px-3 py-1">
              <Shield className="h-3 w-3 mr-1" />
              Professional Grade
            </Badge>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Art Generator
            </TabsTrigger>
            <TabsTrigger value="planner" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Dome & 360° Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator">
            <Suspense
              fallback={
                <div className="flex items-center justify-center min-h-screen">
                  <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
                </div>
              }
            >
              <FlowArtGenerator />
            </Suspense>
          </TabsContent>

          <TabsContent value="planner">
            <Dome360Planner />
          </TabsContent>
        </Tabs>

        {/* Footer */}
        <div className="text-center mt-16 pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground">
            Powered by OpenAI DALL-E 3 • Enhanced with ChatGPT • Professional VR Quality
          </p>
        </div>
      </div>
      <Toaster />
    </div>
  )
}
