import { FlowArtGenerator } from "@/components/flow-art-generator"

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col p-4 md:p-8 bg-gray-100 dark:bg-gray-900">
      <FlowArtGenerator />
    </main>
  )
}
