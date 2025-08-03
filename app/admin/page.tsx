"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Trash2, Download, Undo, Redo, Play } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

/* ---------- tiny IndexedDB queue ---------- */
const openDB = () =>
  new Promise<IDBDatabase>((res) => {
    const req = indexedDB.open("flowsketch", 1)
    req.onupgradeneeded = (e) =>
      (e.target as IDBOpenDBRequest).result.createObjectStore("jobs", { keyPath: "id", autoIncrement: true })
    req.onsuccess = (e) => res((e.target as IDBOpenDBRequest).result)
  })

const addJob = async (payload: any) => {
  const db = await openDB()
  return db.transaction("jobs", "readwrite").objectStore("jobs").add({
    payload,
    status: "pending",
    createdAt: new Date().toISOString(),
  })
}

const listJobs = async () => {
  const db = await openDB()
  const request = db.transaction("jobs").objectStore("jobs").getAll()
  return new Promise<any[]>((resolve) => {
    request.onsuccess = () => resolve(request.result)
  })
}

const delJob = async (id: number) => {
  const db = await openDB()
  return db.transaction("jobs", "readwrite").objectStore("jobs").delete(id)
}

/* ---------- undo / redo ---------- */
let stack: string[] = []
let idx = -1

const pushState = (obj: any) => {
  stack = stack.slice(0, idx + 1)
  stack.push(JSON.stringify(obj))
  idx = stack.length - 1
}

const undo = () => (idx > 0 ? JSON.parse(stack[--idx]) : null)
const redo = () => (idx < stack.length - 1 ? JSON.parse(stack[++idx]) : null)

interface AdminParams {
  prompt: string
  dataPoints: number
  noiseScale: number
  timeStep: number
  resolution: string
  projection: string
  colorScheme: string
  flowType: string
}

export default function AdminPage() {
  const { toast } = useToast()
  const [params, setParams] = useState<AdminParams>({
    prompt: "electric jellyfish flowing through cosmic space",
    dataPoints: 3000,
    noiseScale: 0.1,
    timeStep: 0.01,
    resolution: "4k",
    projection: "equirectangular",
    colorScheme: "rainbow",
    flowType: "spiral",
  })

  const [jobList, setJobList] = useState<any[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  /* thumbnail preview */
  useEffect(() => {
    if (!canvasRef.current) return

    const ctx = canvasRef.current.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, 200, 200)

    // Generate preview based on current parameters
    for (let i = 0; i < Math.min(params.dataPoints, 1000); i++) {
      const t = i * params.timeStep * 20
      const noise = params.noiseScale * Math.sin(i * 0.1)

      let x, y
      if (params.flowType === "spiral") {
        x = 100 + (50 + noise * 20) * Math.cos(t)
        y = 100 + (50 + noise * 20) * Math.sin(t)
      } else if (params.flowType === "wave") {
        x = (i / Math.min(params.dataPoints, 1000)) * 200
        y = 100 + 40 * Math.sin(t + noise)
      } else {
        x = 100 + 80 * Math.cos(t + noise)
        y = 100 + 80 * Math.sin(t * 1.5 + noise)
      }

      // Color based on scheme
      let color
      if (params.colorScheme === "rainbow") {
        color = `hsl(${(t * 50) % 360}, 70%, 60%)`
      } else if (params.colorScheme === "ocean") {
        color = `hsl(${200 + ((t * 20) % 60)}, 80%, 50%)`
      } else {
        color = `hsl(${300 + ((t * 30) % 120)}, 60%, 70%)`
      }

      ctx.fillStyle = color
      ctx.fillRect(x - 1, y - 1, 2, 2)
    }
  }, [params])

  /* keyboard shortcuts */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z" && !e.shiftKey) {
        e.preventDefault()
        const u = undo()
        if (u) {
          setParams(u)
          toast({ title: "Undone", description: "Reverted to previous state" })
        }
      }
      if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "Z")) {
        e.preventDefault()
        const r = redo()
        if (r) {
          setParams(r)
          toast({ title: "Redone", description: "Applied next state" })
        }
      }
    }

    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [toast])

  /* sync offline queue */
  const refreshJobs = useCallback(async () => {
    try {
      const jobs = await listJobs()
      setJobList(jobs)
    } catch (error) {
      console.error("Failed to refresh jobs:", error)
    }
  }, [])

  useEffect(() => {
    refreshJobs()
  }, [refreshJobs])

  const update = (key: keyof AdminParams, value: any) => {
    const next = { ...params, [key]: value }
    setParams(next)
    pushState(next)
  }

  const enqueue = async () => {
    try {
      await addJob(params)
      await refreshJobs()
      toast({
        title: "Job Queued",
        description: "Art generation job added to offline queue",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to queue job",
        variant: "destructive",
      })
    }
  }

  const generateNow = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch("/api/generate-art", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: "Generation Complete",
          description: "Art has been generated successfully",
        })
      } else {
        throw new Error("Generation failed")
      }
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Failed to generate art",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const download = () => {
    const blob = new Blob([JSON.stringify(params, null, 2)], { type: "application/json" })
    const a = document.createElement("a")
    a.href = URL.createObjectURL(blob)
    a.download = `flowsketch-config-${Date.now()}.json`
    a.click()

    toast({
      title: "Settings Exported",
      description: "Configuration saved to file",
    })
  }

  const deleteJob = async (id: number) => {
    try {
      await delJob(id)
      await refreshJobs()
      toast({
        title: "Job Deleted",
        description: "Removed job from queue",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">FlowSketch Admin Panel</h1>
        <p className="text-muted-foreground">Advanced controls for mathematical art generation and job management</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Parameters Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generation Parameters</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Prompt */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Prompt</Label>
                <Textarea
                  id="prompt"
                  value={params.prompt}
                  onChange={(e) => update("prompt", e.target.value)}
                  rows={3}
                  placeholder="Describe the art you want to generate..."
                />
              </div>

              {/* Numeric Parameters */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label>Data Points: {params.dataPoints}</Label>
                  <Slider
                    value={[params.dataPoints]}
                    onValueChange={([value]) => update("dataPoints", value)}
                    min={100}
                    max={10000}
                    step={100}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Noise Scale: {params.noiseScale}</Label>
                  <Slider
                    value={[params.noiseScale]}
                    onValueChange={([value]) => update("noiseScale", value)}
                    min={0}
                    max={1}
                    step={0.01}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Time Step: {params.timeStep}</Label>
                  <Slider
                    value={[params.timeStep]}
                    onValueChange={([value]) => update("timeStep", value)}
                    min={0.001}
                    max={0.1}
                    step={0.001}
                  />
                </div>
              </div>

              {/* Dropdown Parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={params.resolution} onValueChange={(value) => update("resolution", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1k">1K (1024x1024)</SelectItem>
                      <SelectItem value="2k">2K (2048x2048)</SelectItem>
                      <SelectItem value="4k">4K (4096x4096)</SelectItem>
                      <SelectItem value="8k">8K (8192x8192)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Projection</Label>
                  <Select value={params.projection} onValueChange={(value) => update("projection", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="equirectangular">Equirectangular</SelectItem>
                      <SelectItem value="stereographic">Stereographic</SelectItem>
                      <SelectItem value="orthographic">Orthographic</SelectItem>
                      <SelectItem value="mercator">Mercator</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Color Scheme</Label>
                  <Select value={params.colorScheme} onValueChange={(value) => update("colorScheme", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="rainbow">Rainbow</SelectItem>
                      <SelectItem value="ocean">Ocean</SelectItem>
                      <SelectItem value="sunset">Sunset</SelectItem>
                      <SelectItem value="cosmic">Cosmic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Flow Type</Label>
                  <Select value={params.flowType} onValueChange={(value) => update("flowType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spiral">Spiral</SelectItem>
                      <SelectItem value="wave">Wave</SelectItem>
                      <SelectItem value="orbital">Orbital</SelectItem>
                      <SelectItem value="chaotic">Chaotic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button onClick={generateNow} disabled={isGenerating}>
                  <Play className="w-4 h-4 mr-2" />
                  {isGenerating ? "Generating..." : "Generate Now"}
                </Button>
                <Button onClick={enqueue} variant="outline">
                  Queue Render
                </Button>
                <Button onClick={download} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Export Settings
                </Button>
                <Button
                  onClick={() => {
                    const u = undo()
                    if (u) setParams(u)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Undo className="w-4 h-4" />
                </Button>
                <Button
                  onClick={() => {
                    const r = redo()
                    if (r) setParams(r)
                  }}
                  variant="outline"
                  size="sm"
                >
                  <Redo className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-sm text-muted-foreground mt-2">Use Ctrl+Z/Ctrl+Y for undo/redo</p>
            </CardContent>
          </Card>
        </div>

        {/* Preview and Queue Panel */}
        <div className="space-y-6">
          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <canvas ref={canvasRef} width={200} height={200} className="border border-border rounded-lg" />
              </div>
              <p className="text-sm text-muted-foreground text-center mt-2">Real-time preview of current parameters</p>
            </CardContent>
          </Card>

          {/* Job Queue */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Offline Queue
                <Badge variant="secondary">{jobList.length} jobs</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobList.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No jobs in queue</p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {jobList.map((job) => (
                    <div key={job.id} className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{job.payload.prompt}</p>
                        <p className="text-xs text-muted-foreground">
                          {job.payload.dataPoints} points • {job.payload.resolution} • {job.payload.flowType}
                        </p>
                        {job.createdAt && (
                          <p className="text-xs text-muted-foreground">{new Date(job.createdAt).toLocaleString()}</p>
                        )}
                      </div>
                      <Button onClick={() => deleteJob(job.id)} variant="ghost" size="sm">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
