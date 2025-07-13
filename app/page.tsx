import FlowArtGenerator from "@/components/flow-art-generator"
import Gallery from "@/components/gallery"

export default function Home() {
  return (
    <main className="container mx-auto flex max-w-5xl flex-col gap-10 py-12">
      <header className="text-center">
        <h1 className="text-4xl font-bold">FlowSketch – AI&nbsp;Art Playground</h1>
        <p className="mt-2 text-muted-foreground">
          Describe what you’d like to see &amp; let FlowSketch paint it for you ✨
        </p>
      </header>

      <FlowArtGenerator />
      <Gallery />
    </main>
  )
}
