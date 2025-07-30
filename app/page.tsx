"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Palette, GalleryVerticalIcon as GalleryIcon, Cloud, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import FlowArtGenerator from "@/components/flow-art-generator"
import Gallery from "@/components/gallery"
import CloudSyncComponent from "@/components/cloud-sync"
import type { GalleryImage } from "@/lib/gallery-storage"

export default function HomePage() {
  const { theme, setTheme } = useTheme()
  const [selectedImageSettings, setSelectedImageSettings] = useState<Partial<GalleryImage["metadata"]> | null>(null)

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImageSettings(image.metadata)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Palette className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold">FlowSketch</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
              {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Mathematical Art Generator</h2>
          <p className="text-muted-foreground">
            Create stunning mathematical visualizations with customizable parameters and AI assistance.
          </p>
        </div>

        <Tabs defaultValue="generator" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="generator" className="flex items-center gap-2">
              <Palette className="h-4 w-4" />
              Generator
            </TabsTrigger>
            <TabsTrigger value="gallery" className="flex items-center gap-2">
              <GalleryIcon className="h-4 w-4" />
              Gallery
            </TabsTrigger>
            <TabsTrigger value="cloud" className="flex items-center gap-2">
              <Cloud className="h-4 w-4" />
              Cloud Sync
            </TabsTrigger>
          </TabsList>

          <TabsContent value="generator" className="space-y-6">
            <FlowArtGenerator initialSettings={selectedImageSettings || undefined} />
          </TabsContent>

          <TabsContent value="gallery" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Image Gallery</CardTitle>
                <CardDescription>View and manage your generated artwork</CardDescription>
              </CardHeader>
              <CardContent>
                <Gallery onImageSelect={handleImageSelect} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cloud" className="space-y-6">
            <div className="flex justify-center">
              <CloudSyncComponent />
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
