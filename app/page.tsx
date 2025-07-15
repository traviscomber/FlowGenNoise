import FlowArtGenerator from "@/components/flow-art-generator"
import { Gallery } from "@/components/gallery"
import { CloudSync } from "@/components/cloud-sync"
import { ModeToggle } from "@/components/mode-toggle"
import { UserNav } from "@/components/user-nav"

export default function Home() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background">
        <div className="container flex h-16 items-center justify-between py-4">
          <h1 className="text-xl font-bold">FlowSketch</h1>
          <div className="flex items-center gap-4">
            <CloudSync />
            <ModeToggle />
            <UserNav />
          </div>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center p-4 md:p-6">
        <div className="grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-2">
          <FlowArtGenerator />
          <Gallery />
        </div>
      </main>
    </div>
  )
}
