import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { GalleryPage } from "@/components/gallery/gallery-page"

export default function Gallery() {
  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <Link href="/">
            <Button variant="outline" className="flex items-center gap-2 bg-transparent">
              <ArrowLeft className="h-4 w-4" />
              Back to Generator
            </Button>
          </Link>
          <Link
            href="/"
            className="text-2xl font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent"
          >
            FlowSketch
          </Link>
        </div>
        <GalleryPage />
      </div>
    </div>
  )
}
