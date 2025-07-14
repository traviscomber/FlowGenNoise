import type { DataPoint } from "./flow-model"

export interface PlotConfig {
  width: number
  height: number
  strokeWidth: number
  strokeColor: string
  fillColor: string
  backgroundColor: string
  showPoints?: boolean
  pointSize?: number
  showConnections?: boolean
  complexity?: number
  symmetry?: number
  flowIntensity?: number
  scenarioThreshold?: number
}

export class PlotUtils {
  static generateSVG(data: DataPoint[], config: PlotConfig): string {
    try {
      console.log("PlotUtils.generateSVG called with:", {
        dataPoints: data?.length || 0,
        config: {
          width: config.width,
          height: config.height,
          complexity: config.complexity,
          symmetry: config.symmetry,
          flowIntensity: config.flowIntensity,
          scenarioThreshold: config.scenarioThreshold,
        },
      })

      if (!Array.isArray(data) || data.length === 0) {
        console.warn("No data provided to generateSVG")
        return this.createErrorSVG(config.width, config.height, "No data")
      }

      // Validate and clean data points
      const validData = data.filter(
        (point) =>
          point && typeof point.x === "number" && typeof point.y === "number" && isFinite(point.x) && isFinite(point.y),
      )

      if (validData.length === 0) {
        console.warn("No valid data points")
        return this.createErrorSVG(config.width, config.height, "Invalid data")
      }

      // Find data bounds
      const xValues = validData.map((d) => d.x)
      const yValues = validData.map((d) => d.y)
      const xMin = Math.min(...xValues)
      const xMax = Math.max(...xValues)
      const yMin = Math.min(...yValues)
      const yMax = Math.max(...yValues)

      // Prevent division by zero
      const xRange = xMax - xMin || 1
      const yRange = yMax - yMin || 1

      // Apply complexity and flow intensity to margins and scaling
      const baseMargin = 50
      const complexityFactor = (config.complexity || 2) / 2
      const flowFactor = (config.flowIntensity || 1.5) / 1.5
      const margin = baseMargin * (1 + complexityFactor * 0.2)

      const plotWidth = config.width - 2 * margin
      const plotHeight = config.height - 2 * margin

      // Scale data to fit SVG viewport with flow intensity affecting zoom
      const scaleX = (x: number) => margin + ((x - xMin) / xRange) * plotWidth * flowFactor
      const scaleY = (y: number) => margin + ((yMax - y) / yRange) * plotHeight * flowFactor

      // Generate visual elements based on parameters
      const svgElements = []

      // Background
      svgElements.push(`<rect width="100%" height="100%" fill="${config.backgroundColor}"/>`)

      // Apply scenario threshold as background effects
      if (config.scenarioThreshold && config.scenarioThreshold > 0) {
        const threshold = config.scenarioThreshold / 100
        const gradientId = `scenarioGradient${Math.floor(Math.random() * 1000)}`

        svgElements.push(`
          <defs>
            <radialGradient id="${gradientId}" cx="50%" cy="50%" r="50%">
              <stop offset="0%" style="stop-color:${config.strokeColor};stop-opacity:${threshold * 0.1}"/>
              <stop offset="100%" style="stop-color:${config.backgroundColor};stop-opacity:0"/>
            </radialGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#${gradientId})"/>
        `)
      }

      // Generate paths and points based on complexity
      const complexity = config.complexity || 2
      const symmetry = config.symmetry || 0.5
      const showPoints = config.showPoints !== false
      const showConnections = config.showConnections !== false
      const pointSize = (config.pointSize || 2) * (1 + complexity * 0.2)

      // Create path connections if enabled
      if (showConnections && validData.length > 1) {
        const pathData = validData
          .map((point, index) => {
            const x = scaleX(point.x)
            const y = scaleY(point.y)

            // Apply symmetry to path generation
            if (symmetry > 0.7 && index > 0) {
              // High symmetry: smooth curves
              return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            } else if (symmetry < 0.3) {
              // Low symmetry: more chaotic connections
              const prevPoint = validData[index - 1]
              if (prevPoint && index > 0) {
                const prevX = scaleX(prevPoint.x)
                const prevY = scaleY(prevPoint.y)
                const controlX = (x + prevX) / 2 + (Math.random() - 0.5) * 20 * complexity
                const controlY = (y + prevY) / 2 + (Math.random() - 0.5) * 20 * complexity
                return `Q ${controlX} ${controlY} ${x} ${y}`
              }
              return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            } else {
              // Medium symmetry: regular lines
              return index === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
            }
          })
          .join(" ")

        // Apply flow intensity to stroke properties
        const strokeWidth = config.strokeWidth * (0.5 + flowFactor * 0.5)
        const strokeOpacity = Math.max(0.1, Math.min(1, 0.7 * flowFactor))

        svgElements.push(`
          <path 
            d="${pathData}" 
            stroke="${config.strokeColor}" 
            stroke-width="${strokeWidth}"
            stroke-opacity="${strokeOpacity}"
            fill="none" 
            stroke-linecap="round" 
            stroke-linejoin="round"
          />
        `)
      }

      // Create individual points
      if (showPoints) {
        validData.forEach((point, index) => {
          const x = scaleX(point.x)
          const y = scaleY(point.y)

          // Vary point size based on complexity and position
          const variableSize = pointSize * (0.8 + (index / validData.length) * 0.4 * complexity)

          // Apply flow intensity to point opacity and color variation
          const opacity = Math.max(0.3, Math.min(1, 0.8 * flowFactor))

          // Color variation based on position and parameters
          let pointColor = config.strokeColor
          if (complexity > 3) {
            const hue = ((index / validData.length) * 360 * (config.scenarioThreshold || 50)) / 100
            pointColor = `hsl(${hue}, 70%, 50%)`
          }

          svgElements.push(`
            <circle 
              cx="${x}" 
              cy="${y}" 
              r="${variableSize}" 
              fill="${pointColor}" 
              opacity="${opacity}"
            />
          `)
        })
      }

      // Add complexity-based decorative elements
      if (complexity > 3.5) {
        // High complexity: add grid or pattern overlay
        const gridSpacing = 50
        for (let x = margin; x < config.width - margin; x += gridSpacing) {
          svgElements.push(`
            <line 
              x1="${x}" y1="${margin}" 
              x2="${x}" y2="${config.height - margin}" 
              stroke="${config.strokeColor}" 
              stroke-width="0.5" 
              opacity="0.1"
            />
          `)
        }
        for (let y = margin; y < config.height - margin; y += gridSpacing) {
          svgElements.push(`
            <line 
              x1="${margin}" y1="${y}" 
              x2="${config.width - margin}" y2="${y}" 
              stroke="${config.strokeColor}" 
              stroke-width="0.5" 
              opacity="0.1"
            />
          `)
        }
      }

      const finalSVG = `
        <svg width="${config.width}" height="${config.height}" xmlns="http://www.w3.org/2000/svg">
          ${svgElements.join("\n")}
        </svg>
      `

      console.log(
        "Generated SVG with",
        validData.length,
        "points, complexity:",
        complexity,
        "symmetry:",
        symmetry,
        "flow:",
        flowFactor,
      )
      return finalSVG
    } catch (error) {
      console.error("Error in PlotUtils.generateSVG:", error)
      return this.createErrorSVG(config.width, config.height, "Generation error")
    }
  }

  private static createErrorSVG(width: number, height: number, message: string): string {
    return `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="${width / 2}" y="${height / 2}" text-anchor="middle" fill="#ef4444" font-size="16">
          ${message}
        </text>
      </svg>
    `
  }

  static downloadSVG(svgContent: string, filename: string): void {
    try {
      const blob = new Blob([svgContent], { type: "image/svg+xml" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error("Error downloading SVG:", error)
    }
  }

  static svgToDataURL(svgContent: string): string {
    try {
      const base64 = btoa(unescape(encodeURIComponent(svgContent)))
      return `data:image/svg+xml;base64,${base64}`
    } catch (error) {
      console.error("Error converting SVG to data URL:", error)
      return ""
    }
  }
}
