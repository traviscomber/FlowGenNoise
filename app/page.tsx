import { FlowArtGenerator } from "@/components/flow-art-generator"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto py-8">
        <FlowArtGenerator />
      </div>
    </main>
  )
}
