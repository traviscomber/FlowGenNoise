"use client"

import { useState } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import FlowArtGenerator from "@/components/flow-art-generator"
import { Gallery } from "@/components/gallery"
import { Palette, ImageIcon } from "lucide-react"

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("generator")

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-6 max-w-[1800px]">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Palette className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  FlowSketch
                </h1>
                <p className="text-gray-600 text-lg">Mathematical Art Generation Platform</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex justify-center mb-6">
              <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
                <TabsTrigger value="generator" className="text-base">
                  <Palette className="h-5 w-5 mr-2" />
                  Art Generator
                </TabsTrigger>
                <TabsTrigger value="gallery" className="text-base">
                  <ImageIcon className="h-5 w-5 mr-2" />
                  Gallery
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="generator" className="mt-0">
              <FlowArtGenerator />
            </TabsContent>

            <TabsContent value="gallery" className="mt-0">
              <div className="max-w-6xl mx-auto">
                <Gallery />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
