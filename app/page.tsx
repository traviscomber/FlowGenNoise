"use client"

import { useRouter } from "next/navigation"
import { Eye } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function Home() {
  const router = useRouter()

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div>
        <h1>Welcome to the Home Page</h1>
        <p>This is a basic home page.</p>
        <Button onClick={() => router.push("/gallery")} variant="outline" className="flex items-center gap-2">
          <Eye className="w-4 h-4" />
          View Gallery
        </Button>
      </div>
    </main>
  )
}
