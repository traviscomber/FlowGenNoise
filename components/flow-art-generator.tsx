"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Loader2 } from "lucide-react"

export function FlowArtGenerator() {
  const [dataset, setDataset] = useState<string>("spirals")
  const [seed, setSeed] = useState<number>(1234)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setImageUrl(null)
    try {
      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ dataset, seed }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate image")
      }

      const data = await response.json()
      setImageUrl(data.image)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center w-full p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">FlowSketch Art Generator</CardTitle>
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Create structured art using toy datasets.
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataset">Dataset</Label>
              <Select value={dataset} onValueChange={setDataset}>
                <SelectTrigger id="dataset">
                  <SelectValue placeholder="Select a dataset" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="spirals">Spirals</SelectItem>
                  <SelectItem value="checkerboard">Checkerboard</SelectItem>
                  <SelectItem value="moons">Moons</SelectItem>
                  <SelectItem value="gaussian">Gaussian</SelectItem>
                  <SelectItem value="grid">Grid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="seed">Seed</Label>
              <Input
                id="seed"
                type="number"
                value={seed}
                onChange={(e) => setSeed(Number(e.target.value))}
                placeholder="Enter a seed"
              />
            </div>
          </div>
          <Button onClick={handleGenerate} className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Flow Art"
            )}
          </Button>
          {error && <p className="text-red-500 text-center">{error}</p>}
          {imageUrl && (
            <div className="mt-6 flex justify-center">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Generated Flow Art"
                className="max-w-full h-auto border rounded-lg shadow-md"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
