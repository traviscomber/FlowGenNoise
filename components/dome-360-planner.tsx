"use client"

import { useState, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { Globe, Camera, Download, Settings } from "lucide-react"

interface DomeSpecs {
  diameter: number
  height: number
  projectionType: string
  resolution: string
  viewingDistance: number
}

interface CameraSetup {
  cameraType: string
  lensType: string
  focalLength: number
  aperture: string
  iso: number
  shutterSpeed: string
  overlap: number
}

interface ShootingPlan {
  totalShots: number
  rows: number
  shotsPerRow: number[]
  elevationAngles: number[]
  azimuthSteps: number[]
  estimatedTime: number
}

export function Dome360Planner() {
  const [domeSpecs, setDomeSpecs] = useState<DomeSpecs>({
    diameter: 30,
    height: 15,
    projectionType: "fulldome",
    resolution: "8K",
    viewingDistance: 10,
  })

  const [cameraSetup, setCameraSetup] = useState<CameraSetup>({
    cameraType: "dslr",
    lensType: "fisheye",
    focalLength: 8,
    aperture: "f/8",
    iso: 100,
    shutterSpeed: "1/125",
    overlap: 30,
  })

  const [shootingPlan, setShootingPlan] = useState<ShootingPlan | null>(null)
  const [selectedProjection, setSelectedProjection] = useState<"little-planet" | "tunnel">("little-planet")

  const calculateShootingPlan = useCallback(() => {
    const { diameter, height } = domeSpecs
    const { focalLength, overlap } = cameraSetup

    // Calculate field of view based on lens
    const fov =
      cameraSetup.lensType === "fisheye"
        ? 180
        : cameraSetup.lensType === "ultrawide"
          ? 120
          : 2 * Math.atan(36 / (2 * focalLength)) * (180 / Math.PI)

    // Calculate effective FOV with overlap
    const effectiveFov = fov * (1 - overlap / 100)

    // Calculate number of rows (elevation steps)
    const rows = Math.ceil(90 / effectiveFov) + 1 // From horizon to zenith

    // Calculate shots per row based on elevation
    const elevationAngles: number[] = []
    const shotsPerRow: number[] = []
    const azimuthSteps: number[] = []

    for (let row = 0; row < rows; row++) {
      const elevation = (row * 90) / (rows - 1)
      elevationAngles.push(elevation)

      // At higher elevations, we need fewer shots due to convergence
      const circumferenceAtElevation = 360 * Math.cos((elevation * Math.PI) / 180)
      const shotsNeeded = Math.max(1, Math.ceil(circumferenceAtElevation / effectiveFov))

      shotsPerRow.push(shotsNeeded)
      azimuthSteps.push(360 / shotsNeeded)
    }

    // Add nadir shot if needed
    const totalShots = shotsPerRow.reduce((sum, shots) => sum + shots, 0) + 1

    // Estimate shooting time (including setup, adjustments, etc.)
    const timePerShot = 30 // seconds
    const estimatedTime = (totalShots * timePerShot) / 60 // minutes

    setShootingPlan({
      totalShots,
      rows,
      shotsPerRow,
      elevationAngles,
      azimuthSteps,
      estimatedTime,
    })
  }, [domeSpecs, cameraSetup])

  const getResolutionSpecs = (resolution: string) => {
    const specs = {
      "4K": { width: 4096, height: 4096, pixels: "16.8M" },
      "6K": { width: 6144, height: 6144, pixels: "37.7M" },
      "8K": { width: 8192, height: 8192, pixels: "67.1M" },
      "12K": { width: 12288, height: 12288, pixels: "150.9M" },
    }
    return specs[resolution as keyof typeof specs] || specs["8K"]
  }

  const getCameraRecommendations = () => {
    const recommendations = {
      professional: [
        "Canon EOS R5 + RF 8-15mm f/4L Fisheye",
        "Nikon Z9 + NIKKOR Z 14-24mm f/2.8 S",
        "Sony α7R V + FE 12-24mm f/2.8 GM",
      ],
      prosumer: [
        "Canon EOS R6 Mark II + RF 15-35mm f/2.8L",
        "Nikon Z6 III + Z 14-30mm f/4 S",
        "Sony α7 IV + FE 16-35mm f/2.8 GM",
      ],
      specialized: [
        "Insta360 Pro 2 (8K 360° camera)",
        "Kandao Obsidian Pro (12K 360° camera)",
        "Z CAM V1 Pro (Professional VR camera)",
      ],
    }
    return recommendations
  }

  const downloadShootingGuide = () => {
    if (!shootingPlan) return

    const guide = `
DOME 360° PHOTOGRAPHY SHOOTING GUIDE
===================================

DOME SPECIFICATIONS:
- Diameter: ${domeSpecs.diameter}m
- Height: ${domeSpecs.height}m
- Projection: ${domeSpecs.projectionType}
- Target Resolution: ${domeSpecs.resolution}

CAMERA SETUP:
- Camera Type: ${cameraSetup.cameraType}
- Lens: ${cameraSetup.lensType} ${cameraSetup.focalLength}mm
- Settings: ${cameraSetup.aperture}, ISO ${cameraSetup.iso}, ${cameraSetup.shutterSpeed}
- Overlap: ${cameraSetup.overlap}%

SHOOTING PLAN:
- Total Shots: ${shootingPlan.totalShots}
- Number of Rows: ${shootingPlan.rows}
- Estimated Time: ${Math.round(shootingPlan.estimatedTime)} minutes

DETAILED SHOT LIST:
${shootingPlan.elevationAngles
  .map(
    (elevation, index) =>
      `Row ${index + 1}: Elevation ${elevation.toFixed(1)}° - ${shootingPlan.shotsPerRow[index]} shots every ${shootingPlan.azimuthSteps[index].toFixed(1)}°`,
  )
  .join("\n")}

EQUIPMENT CHECKLIST:
□ Camera body with fully charged batteries (bring spares)
□ Wide-angle/fisheye lens
□ Sturdy tripod with panoramic head
□ Remote shutter release or intervalometer
□ Lens cleaning kit
□ Memory cards (high-speed, large capacity)
□ Laptop for immediate backup
□ Light meter or smartphone light app
□ Compass for orientation reference

SHOOTING TIPS:
1. Shoot in RAW format for maximum post-processing flexibility
2. Use manual exposure to maintain consistency across all shots
3. Focus to hyperfocal distance for maximum sharpness
4. Take test shots to verify exposure and white balance
5. Mark tripod position for potential re-shoots
6. Shoot during golden hour for best lighting (if outdoors)
7. Consider HDR bracketing for high dynamic range scenes

POST-PROCESSING WORKFLOW:
1. Import and organize all images
2. Apply lens corrections and chromatic aberration removal
3. Color correct and match exposures across all shots
4. Stitch panorama using specialized software (PTGui, Autopano, etc.)
5. Convert to fulldome format for projection
6. Test projection on dome before final delivery

SOFTWARE RECOMMENDATIONS:
- PTGui Pro (panorama stitching)
- Adobe Lightroom (RAW processing)
- Photoshop (final touch-ups)
- DomeProjection software for fulldome conversion
    `

    const blob = new Blob([guide], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `dome-360-shooting-guide-${domeSpecs.diameter}m.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-4xl font-bold text-white">
            <Globe className="mr-2 inline-block h-8 w-8 text-purple-400" />
            360° Dome Projection Planner
          </h1>
          <p className="text-lg text-slate-300">Plan and visualize stereographic projections for dome installations</p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Configuration Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Camera className="mr-2 h-5 w-5" />
                  Projection Settings
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your stereographic projection parameters
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Projection Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant={selectedProjection === "little-planet" ? "default" : "outline"}
                      onClick={() => setSelectedProjection("little-planet")}
                      className="h-auto flex-col p-4"
                    >
                      <div className="font-medium">Little Planet</div>
                      <div className="text-xs opacity-70">Spherical projection</div>
                    </Button>
                    <Button
                      variant={selectedProjection === "tunnel" ? "default" : "outline"}
                      onClick={() => setSelectedProjection("tunnel")}
                      className="h-auto flex-col p-4"
                    >
                      <div className="font-medium">Tunnel View</div>
                      <div className="text-xs opacity-70">Inverted perspective</div>
                    </Button>
                  </div>
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-2">
                  <Label>Dome Diameter (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.diameter}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, diameter: Number(e.target.value) }))}
                    min="5"
                    max="100"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dome Height (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.height}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, height: Number(e.target.value) }))}
                    min="2"
                    max="50"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Projection Type</Label>
                  <Select
                    value={domeSpecs.projectionType}
                    onValueChange={(value) => setDomeSpecs((prev) => ({ ...prev, projectionType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulldome">Fulldome (180°)</SelectItem>
                      <SelectItem value="planetarium">Planetarium</SelectItem>
                      <SelectItem value="immersive">Immersive Experience</SelectItem>
                      <SelectItem value="scientific">Scientific Visualization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Resolution</Label>
                  <Select
                    value={domeSpecs.resolution}
                    onValueChange={(value) => setDomeSpecs((prev) => ({ ...prev, resolution: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4K">4K (4096×4096)</SelectItem>
                      <SelectItem value="6K">6K (6144×6144)</SelectItem>
                      <SelectItem value="8K">8K (8192×8192)</SelectItem>
                      <SelectItem value="12K">12K (12288×12288)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Average Viewing Distance (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.viewingDistance}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, viewingDistance: Number(e.target.value) }))}
                    min="1"
                    max="20"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <Separator className="bg-slate-600" />

                <div className="space-y-2">
                  <Label>Camera Type</Label>
                  <Select
                    value={cameraSetup.cameraType}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, cameraType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dslr">DSLR</SelectItem>
                      <SelectItem value="mirrorless">Mirrorless</SelectItem>
                      <SelectItem value="360camera">360° Camera</SelectItem>
                      <SelectItem value="medium_format">Medium Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lens Type</Label>
                  <Select
                    value={cameraSetup.lensType}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, lensType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisheye">Fisheye (8-16mm)</SelectItem>
                      <SelectItem value="ultrawide">Ultra-wide (14-24mm)</SelectItem>
                      <SelectItem value="wide">Wide-angle (16-35mm)</SelectItem>
                      <SelectItem value="standard">Standard (24-70mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Focal Length (mm)</Label>
                  <Input
                    type="number"
                    value={cameraSetup.focalLength}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, focalLength: Number(e.target.value) }))}
                    min="8"
                    max="200"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aperture</Label>
                  <Select
                    value={cameraSetup.aperture}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, aperture: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="f/2.8">f/2.8</SelectItem>
                      <SelectItem value="f/4">f/4</SelectItem>
                      <SelectItem value="f/5.6">f/5.6</SelectItem>
                      <SelectItem value="f/8">f/8 (Recommended)</SelectItem>
                      <SelectItem value="f/11">f/11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ISO</Label>
                  <Input
                    type="number"
                    value={cameraSetup.iso}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, iso: Number(e.target.value) }))}
                    min="50"
                    max="6400"
                    step="50"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overlap Percentage</Label>
                  <Input
                    type="number"
                    value={cameraSetup.overlap}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, overlap: Number(e.target.value) }))}
                    min="20"
                    max="50"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <Separator className="bg-slate-600" />

                <div className="flex gap-2">
                  <Button onClick={calculateShootingPlan} className="flex-1">
                    <Settings className="mr-2 h-4 w-4" />
                    Configure
                  </Button>
                  <Button onClick={downloadShootingGuide} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Export
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dome Specifications Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Globe className="mr-2 h-5 w-5" />
                  Dome Specifications
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Enter the dimensions and other specifications of your dome
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Dome Diameter (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.diameter}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, diameter: Number(e.target.value) }))}
                    min="5"
                    max="100"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dome Height (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.height}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, height: Number(e.target.value) }))}
                    min="2"
                    max="50"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Projection Type</Label>
                  <Select
                    value={domeSpecs.projectionType}
                    onValueChange={(value) => setDomeSpecs((prev) => ({ ...prev, projectionType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fulldome">Fulldome (180°)</SelectItem>
                      <SelectItem value="planetarium">Planetarium</SelectItem>
                      <SelectItem value="immersive">Immersive Experience</SelectItem>
                      <SelectItem value="scientific">Scientific Visualization</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Target Resolution</Label>
                  <Select
                    value={domeSpecs.resolution}
                    onValueChange={(value) => setDomeSpecs((prev) => ({ ...prev, resolution: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4K">4K (4096×4096)</SelectItem>
                      <SelectItem value="6K">6K (6144×6144)</SelectItem>
                      <SelectItem value="8K">8K (8192×8192)</SelectItem>
                      <SelectItem value="12K">12K (12288×12288)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Average Viewing Distance (meters)</Label>
                  <Input
                    type="number"
                    value={domeSpecs.viewingDistance}
                    onChange={(e) => setDomeSpecs((prev) => ({ ...prev, viewingDistance: Number(e.target.value) }))}
                    min="1"
                    max="20"
                    className="bg-slate-900 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Camera Setup Panel */}
          <div className="md:col-span-1 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="flex items-center text-white">
                  <Camera className="mr-2 h-5 w-5" />
                  Camera Setup
                </CardTitle>
                <CardDescription className="text-slate-400">
                  Configure your camera settings for optimal dome photography
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Camera Type</Label>
                  <Select
                    value={cameraSetup.cameraType}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, cameraType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dslr">DSLR</SelectItem>
                      <SelectItem value="mirrorless">Mirrorless</SelectItem>
                      <SelectItem value="360camera">360° Camera</SelectItem>
                      <SelectItem value="medium_format">Medium Format</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Lens Type</Label>
                  <Select
                    value={cameraSetup.lensType}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, lensType: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fisheye">Fisheye (8-16mm)</SelectItem>
                      <SelectItem value="ultrawide">Ultra-wide (14-24mm)</SelectItem>
                      <SelectItem value="wide">Wide-angle (16-35mm)</SelectItem>
                      <SelectItem value="standard">Standard (24-70mm)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Focal Length (mm)</Label>
                  <Input
                    type="number"
                    value={cameraSetup.focalLength}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, focalLength: Number(e.target.value) }))}
                    min="8"
                    max="200"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Aperture</Label>
                  <Select
                    value={cameraSetup.aperture}
                    onValueChange={(value) => setCameraSetup((prev) => ({ ...prev, aperture: value }))}
                    className="bg-slate-900 text-white"
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="f/2.8">f/2.8</SelectItem>
                      <SelectItem value="f/4">f/4</SelectItem>
                      <SelectItem value="f/5.6">f/5.6</SelectItem>
                      <SelectItem value="f/8">f/8 (Recommended)</SelectItem>
                      <SelectItem value="f/11">f/11</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ISO</Label>
                  <Input
                    type="number"
                    value={cameraSetup.iso}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, iso: Number(e.target.value) }))}
                    min="50"
                    max="6400"
                    step="50"
                    className="bg-slate-900 text-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overlap Percentage</Label>
                  <Input
                    type="number"
                    value={cameraSetup.overlap}
                    onChange={(e) => setCameraSetup((prev) => ({ ...prev, overlap: Number(e.target.value) }))}
                    min="20"
                    max="50"
                    className="bg-slate-900 text-white"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-2 space-y-4">
            <Tabs defaultValue="plan" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="plan">Shooting Plan</TabsTrigger>
                <TabsTrigger value="equipment">Equipment</TabsTrigger>
                <TabsTrigger value="technical">Technical</TabsTrigger>
                <TabsTrigger value="workflow">Workflow</TabsTrigger>
              </TabsList>

              <TabsContent value="plan" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Shooting Plan Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {shootingPlan ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{shootingPlan.totalShots}</div>
                            <div className="text-sm text-gray-600">Total Shots</div>
                          </div>
                          <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{shootingPlan.rows}</div>
                            <div className="text-sm text-gray-600">Elevation Rows</div>
                          </div>
                          <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">
                              {Math.round(shootingPlan.estimatedTime)}
                            </div>
                            <div className="text-sm text-gray-600">Minutes</div>
                          </div>
                          <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">
                              {getResolutionSpecs(domeSpecs.resolution).pixels}
                            </div>
                            <div className="text-sm text-gray-600">Final Pixels</div>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <h4 className="font-semibold">Detailed Shot Breakdown:</h4>
                          {shootingPlan.elevationAngles.map((elevation, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                            >
                              <div className="flex items-center gap-3">
                                <Badge variant="outline">Row {index + 1}</Badge>
                                <span className="text-sm">Elevation: {elevation.toFixed(1)}°</span>
                              </div>
                              <div className="flex items-center gap-3">
                                <span className="text-sm">{shootingPlan.shotsPerRow[index]} shots</span>
                                <span className="text-xs text-gray-500">
                                  every {shootingPlan.azimuthSteps[index].toFixed(1)}°
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <Alert>
                          <Globe className="h-4 w-4" />
                          <AlertDescription>
                            Plan includes one additional nadir (straight down) shot. Consider bracketing exposures for
                            HDR processing.
                          </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-500">
                        <Camera className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Click "Configure" to generate your custom shooting plan</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="equipment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="h-5 w-5 text-blue-600" />
                      Recommended Equipment
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {Object.entries(getCameraRecommendations()).map(([category, cameras]) => (
                      <div key={category} className="space-y-3">
                        <h4 className="font-semibold capitalize">{category} Cameras</h4>
                        <div className="space-y-2">
                          {cameras.map((camera, index) => (
                            <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex items-center gap-2">
                                <Globe className="h-4 w-4 text-green-500" />
                                <span className="text-sm">{camera}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Essential Accessories</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                          "Heavy-duty tripod with panoramic head",
                          "Remote shutter release/intervalometer",
                          "High-speed memory cards (64GB+)",
                          "Extra batteries and charger",
                          "Lens cleaning kit",
                          "Laptop for immediate backup",
                          "Light meter or smartphone app",
                          "Compass for orientation reference",
                        ].map((item, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded"
                          >
                            <Globe className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="technical" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Technical Specifications
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h4 className="font-semibold">Dome Calculations</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Surface Area:</span>
                            <span className="text-white">
                              {(2 * Math.PI * Math.pow(domeSpecs.diameter / 2, 2)).toFixed(1)} m²
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Volume:</span>
                            <span className="text-white">
                              {((2 / 3) * Math.PI * Math.pow(domeSpecs.diameter / 2, 3)).toFixed(1)} m³
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Circumference:</span>
                            <span className="text-white">{(Math.PI * domeSpecs.diameter).toFixed(1)} m</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Viewing Angle:</span>
                            <span className="text-white">180° (hemisphere)</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h4 className="font-semibold">Resolution Details</h4>
                        <div className="space-y-2 text-sm">
                          {(() => {
                            const specs = getResolutionSpecs(domeSpecs.resolution)
                            return (
                              <>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Final Resolution:</span>
                                  <span className="text-white">
                                    {specs.width} × {specs.height}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Total Pixels:</span>
                                  <span className="text-white">{specs.pixels}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">Pixels per Degree:</span>
                                  <span className="text-white">{(specs.width / 360).toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-slate-400">File Size (RAW):</span>
                                  <span className="text-white">
                                    ~{Math.round((specs.width * specs.height * 3) / 1000000)} MB
                                  </span>
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                      <h4 className="font-semibold">Camera Settings Recommendations</h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-green-600" />
                            <span className="font-medium text-green-600">Bright Conditions</span>
                          </div>
                          <div className="text-sm space-y-1 text-green-600">
                            <div>ISO: 100-200</div>
                            <div>Aperture: f/8-f/11</div>
                            <div>Shutter: 1/125-1/250s</div>
                          </div>
                        </div>

                        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-yellow-600" />
                            <span className="font-medium text-yellow-600">Golden Hour</span>
                          </div>
                          <div className="text-sm space-y-1 text-yellow-600">
                            <div>ISO: 200-400</div>
                            <div>Aperture: f/5.6-f/8</div>
                            <div>Shutter: 1/60-1/125s</div>
                          </div>
                        </div>

                        <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Globe className="h-4 w-4 text-blue-600" />
                            <span className="font-medium text-blue-600">Low Light</span>
                          </div>
                          <div className="text-sm space-y-1 text-blue-600">
                            <div>ISO: 400-1600</div>
                            <div>Aperture: f/4-f/5.6</div>
                            <div>Shutter: 1/30-1/60s</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Alert>
                      <Globe className="h-4 w-4" />
                      <AlertDescription>
                        For dome projection, maintain consistent exposure across all shots. Use manual mode and avoid
                        auto-exposure.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="workflow" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="h-5 w-5 text-blue-600" />
                      Complete Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="p-4 border-l-4 border-blue-500 bg-blue-50 dark:bg-blue-900/20">
                        <h4 className="font-semibold text-blue-700 dark:text-blue-300">1. Pre-Production</h4>
                        <ul className="mt-2 text-sm space-y-1 text-blue-600 dark:text-blue-400">
                          <li>• Scout location and plan shooting positions</li>
                          <li>• Check weather conditions and lighting</li>
                          <li>• Prepare and test all equipment</li>
                          <li>• Create shot list and timing schedule</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-4 border-green-500 bg-green-50 dark:bg-green-900/20">
                        <h4 className="font-semibold text-green-700 dark:text-green-300">2. Shooting Day</h4>
                        <ul className="mt-2 text-sm space-y-1 text-green-600 dark:text-green-400">
                          <li>• Set up tripod at calculated center position</li>
                          <li>• Configure camera settings (manual mode)</li>
                          <li>• Take test shots and verify exposure</li>
                          <li>• Execute shooting plan systematically</li>
                          <li>• Backup images immediately after each row</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-4 border-purple-500 bg-purple-50 dark:bg-purple-900/20">
                        <h4 className="font-semibold text-purple-700 dark:text-purple-300">3. Post-Production</h4>
                        <ul className="mt-2 text-sm space-y-1 text-purple-600 dark:text-purple-400">
                          <li>• Import and organize all RAW files</li>
                          <li>• Apply lens corrections and color grading</li>
                          <li>• Stitch panorama using PTGui or similar</li>
                          <li>• Convert to fulldome projection format</li>
                          <li>• Test on dome system before delivery</li>
                        </ul>
                      </div>

                      <div className="p-4 border-l-4 border-orange-500 bg-orange-50 dark:bg-orange-900/20">
                        <h4 className="font-semibold text-orange-700 dark:text-orange-300">
                          4. Delivery & Installation
                        </h4>
                        <ul className="mt-2 text-sm space-y-1 text-orange-600 dark:text-orange-400">
                          <li>• Export in required dome format (fisheye, cubic, etc.)</li>
                          <li>• Provide multiple resolution versions</li>
                          <li>• Include calibration and alignment guides</li>
                          <li>• Test projection and make final adjustments</li>
                        </ul>
                      </div>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                      <h4 className="font-semibold">Recommended Software</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <h5 className="font-medium text-blue-600">Stitching & Processing</h5>
                          <div className="space-y-1 text-sm text-blue-600">
                            <div>• PTGui Pro (panorama stitching)</div>
                            <div>• Adobe Lightroom (RAW processing)</div>
                            <div>• Photoshop (final touch-ups)</div>
                            <div>• Autopano Giga (alternative stitching)</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <h5 className="font-medium text-blue-600">Dome Conversion</h5>
                          <div className="space-y-1 text-sm text-blue-600">
                            <div>• DomeProjection software</div>
                            <div>• Fulldome Toolkit</div>
                            <div>• WorldWide Telescope</div>
                            <div>• Custom projection scripts</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Projection Preview Panel */}
          <div className="md:col-span-2 space-y-4">
            <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-white">Projection Preview</CardTitle>
                <CardDescription className="text-slate-400">
                  Visualize how your content will appear on the dome
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="aspect-square w-full rounded-lg border border-slate-600 bg-slate-900 p-4">
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <Globe className="mx-auto h-16 w-16 text-slate-600" />
                      <p className="mt-4 text-slate-400">Dome projection preview</p>
                      <Badge variant="outline" className="mt-2">
                        {selectedProjection === "little-planet" ? "Little Planet" : "Tunnel View"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
