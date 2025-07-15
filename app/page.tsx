import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ImageIcon } from "lucide-react"
import { FlowArtGenerator } from "@/components/flow-art-generator"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            FlowSketch
          </Link>
          <Link href="/gallery">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ImageIcon className="h-4 w-4" />
              Gallery
            </Button>
          </Link>
        </div>
        <FlowArtGenerator />
      </div>
    </main>
  )
}
