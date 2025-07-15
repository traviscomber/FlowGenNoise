"use client"

import { Button } from "@/components/ui/button"
import { FlowArtGenerator } from "@/components/flow-art-generator"
import { ModeToggle } from "@/components/mode-toggle"
import { Eye } from "lucide-react"

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
      <h1 className="text-4xl font-bold mb-2">Flow Art Generator</h1>
      <p className="text-muted-foreground mb-8">Create beautiful, flowing art with AI.</p>

      <div className="flex justify-center mb-6">
        <Button
          onClick={() => (window.location.href = "/gallery")}
          variant="outline"
          className="flex items-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Gallery
        </Button>
      </div>

      <FlowArtGenerator />
    </main>
  )
}
