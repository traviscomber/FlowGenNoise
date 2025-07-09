// lib/client-upscaler.ts - Advanced image processing for large format printing

export class ClientUpscaler {
  /**
   * Professional image upscaling with advanced algorithms for large format printing
   */
  static async upscaleImage(imageUrl: string, scaleFactor = 4): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          // Step 1: Initial upscaling with Lanczos-like filtering
          const canvas1 = document.createElement("canvas")
          const ctx1 = canvas1.getContext("2d")
          if (!ctx1) throw new Error("Could not get canvas context")

          canvas1.width = img.width * scaleFactor
          canvas1.height = img.height * scaleFactor

          // Use high-quality bicubic interpolation
          ctx1.imageSmoothingEnabled = true
          ctx1.imageSmoothingQuality = "high"
          ctx1.drawImage(img, 0, 0, canvas1.width, canvas1.height)

          // Step 2: Apply advanced post-processing
          const processedCanvas = this.applyAdvancedPostProcessing(canvas1)

          resolve(processedCanvas.toDataURL("image/png", 1.0))
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }

  /**
   * Advanced post-processing pipeline for print-quality enhancement
   */
  private static applyAdvancedPostProcessing(canvas: HTMLCanvasElement): HTMLCanvasElement {
    const ctx = canvas.getContext("2d")!
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)

    // Apply multiple enhancement passes
    let processedData = imageData

    // 1. Unsharp masking for edge enhancement
    processedData = this.applyUnsharpMask(processedData, 1.5, 1.0, 0.05)

    // 2. Adaptive contrast enhancement
    processedData = this.applyAdaptiveContrast(processedData)

    // 3. Color vibrance enhancement
    processedData = this.enhanceColorVibrance(processedData, 1.2)

    // 4. Noise reduction while preserving edges
    processedData = this.applyEdgePreservingSmoothing(processedData)

    // 5. Final sharpening pass
    processedData = this.applyAdvancedSharpening(processedData)

    ctx.putImageData(processedData, 0, 0)
    return canvas
  }

  /**
   * Unsharp masking - professional sharpening technique
   */
  private static applyUnsharpMask(imageData: ImageData, amount: number, radius: number, threshold: number): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    // Create Gaussian blur for mask
    const blurred = this.gaussianBlur(imageData, radius)

    for (let i = 0; i < data.length; i += 4) {
      for (let c = 0; c < 3; c++) {
        const original = data[i + c]
        const blur = blurred.data[i + c]
        const diff = original - blur

        // Apply threshold
        if (Math.abs(diff) > threshold * 255) {
          const sharpened = original + amount * diff
          output.data[i + c] = Math.max(0, Math.min(255, sharpened))
        } else {
          output.data[i + c] = original
        }
      }
      output.data[i + 3] = data[i + 3] // Alpha
    }

    return output
  }

  /**
   * Gaussian blur implementation
   */
  private static gaussianBlur(imageData: ImageData, radius: number): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    // Simple box blur approximation of Gaussian
    const size = Math.ceil(radius * 2) + 1
    const kernel = new Array(size).fill(1 / size)

    // Horizontal pass
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          let count = 0

          for (let k = 0; k < size; k++) {
            const px = x + k - Math.floor(size / 2)
            if (px >= 0 && px < width) {
              sum += data[(y * width + px) * 4 + c] * kernel[k]
              count += kernel[k]
            }
          }

          output.data[(y * width + x) * 4 + c] = sum / count
        }
        output.data[(y * width + x) * 4 + 3] = data[(y * width + x) * 4 + 3]
      }
    }

    return output
  }

  /**
   * Adaptive contrast enhancement using CLAHE-like algorithm
   */
  private static applyAdaptiveContrast(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    // Tile-based adaptive histogram equalization
    const tileSize = 64
    const clipLimit = 2.0

    for (let ty = 0; ty < height; ty += tileSize) {
      for (let tx = 0; tx < width; tx += tileSize) {
        const tileWidth = Math.min(tileSize, width - tx)
        const tileHeight = Math.min(tileSize, height - ty)

        // Calculate histogram for this tile
        const histogram = new Array(256).fill(0)
        let totalPixels = 0

        for (let y = ty; y < ty + tileHeight; y++) {
          for (let x = tx; x < tx + tileWidth; x++) {
            const idx = (y * width + x) * 4
            const gray = Math.round(0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2])
            histogram[gray]++
            totalPixels++
          }
        }

        // Apply contrast enhancement to tile
        for (let y = ty; y < ty + tileHeight; y++) {
          for (let x = tx; x < tx + tileWidth; x++) {
            const idx = (y * width + x) * 4

            for (let c = 0; c < 3; c++) {
              const value = data[idx + c]
              const enhanced = this.enhancePixelContrast(value, histogram, totalPixels, clipLimit)
              output.data[idx + c] = Math.max(0, Math.min(255, enhanced))
            }
            output.data[idx + 3] = data[idx + 3]
          }
        }
      }
    }

    return output
  }

  private static enhancePixelContrast(
    value: number,
    histogram: number[],
    totalPixels: number,
    clipLimit: number,
  ): number {
    // Simple contrast enhancement based on local statistics
    const mean = histogram.reduce((sum, count, intensity) => sum + intensity * count, 0) / totalPixels
    const variance =
      histogram.reduce((sum, count, intensity) => sum + count * Math.pow(intensity - mean, 2), 0) / totalPixels
    const stdDev = Math.sqrt(variance)

    if (stdDev > 0) {
      const normalized = (value - mean) / stdDev
      const enhanced = mean + normalized * stdDev * clipLimit
      return enhanced
    }

    return value
  }

  /**
   * Color vibrance enhancement (selective saturation)
   */
  private static enhanceColorVibrance(imageData: ImageData, vibranceAmount: number): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i] / 255
      const g = data[i + 1] / 255
      const b = data[i + 2] / 255

      // Convert to HSL
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      const diff = max - min
      const sum = max + min
      const lightness = sum / 2

      if (diff === 0) {
        // Grayscale - no change
        output.data[i] = data[i]
        output.data[i + 1] = data[i + 1]
        output.data[i + 2] = data[i + 2]
      } else {
        const saturation = lightness > 0.5 ? diff / (2 - sum) : diff / sum

        // Apply vibrance (less effect on already saturated colors)
        const vibranceMultiplier = 1 + (vibranceAmount - 1) * (1 - saturation)
        const newSaturation = Math.min(1, saturation * vibranceMultiplier)

        // Convert back to RGB
        const c = (1 - Math.abs(2 * lightness - 1)) * newSaturation
        const x =
          c *
          (1 - Math.abs(((max === r ? (g - b) / diff : max === g ? 2 + (b - r) / diff : 4 + (r - g) / diff) % 6) - 1))
        const m = lightness - c / 2

        let newR, newG, newB
        if (max === r) {
          newR = c + m
          newG = x + m
          newB = m
        } else if (max === g) {
          newR = x + m
          newG = c + m
          newB = m
        } else {
          newR = m
          newG = x + m
          newB = c + m
        }

        output.data[i] = Math.max(0, Math.min(255, newR * 255))
        output.data[i + 1] = Math.max(0, Math.min(255, newG * 255))
        output.data[i + 2] = Math.max(0, Math.min(255, newB * 255))
      }

      output.data[i + 3] = data[i + 3] // Alpha
    }

    return output
  }

  /**
   * Edge-preserving smoothing (bilateral filter approximation)
   */
  private static applyEdgePreservingSmoothing(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    const spatialSigma = 2
    const intensitySigma = 30
    const kernelSize = 5
    const halfKernel = Math.floor(kernelSize / 2)

    for (let y = halfKernel; y < height - halfKernel; y++) {
      for (let x = halfKernel; x < width - halfKernel; x++) {
        const centerIdx = (y * width + x) * 4

        for (let c = 0; c < 3; c++) {
          let weightSum = 0
          let valueSum = 0
          const centerValue = data[centerIdx + c]

          for (let ky = -halfKernel; ky <= halfKernel; ky++) {
            for (let kx = -halfKernel; kx <= halfKernel; kx++) {
              const neighborIdx = ((y + ky) * width + (x + kx)) * 4
              const neighborValue = data[neighborIdx + c]

              // Spatial weight
              const spatialDist = Math.sqrt(kx * kx + ky * ky)
              const spatialWeight = Math.exp(-(spatialDist * spatialDist) / (2 * spatialSigma * spatialSigma))

              // Intensity weight
              const intensityDist = Math.abs(centerValue - neighborValue)
              const intensityWeight = Math.exp(-(intensityDist * intensityDist) / (2 * intensitySigma * intensitySigma))

              const weight = spatialWeight * intensityWeight
              weightSum += weight
              valueSum += neighborValue * weight
            }
          }

          output.data[centerIdx + c] = valueSum / weightSum
        }

        output.data[centerIdx + 3] = data[centerIdx + 3] // Alpha
      }
    }

    // Copy edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y < halfKernel || y >= height - halfKernel || x < halfKernel || x >= width - halfKernel) {
          const idx = (y * width + x) * 4
          for (let c = 0; c < 4; c++) {
            output.data[idx + c] = data[idx + c]
          }
        }
      }
    }

    return output
  }

  /**
   * Advanced sharpening using high-pass filter
   */
  private static applyAdvancedSharpening(imageData: ImageData): ImageData {
    const { data, width, height } = imageData
    const output = new ImageData(width, height)

    // High-pass sharpening kernel
    const kernel = [
      [0, -0.25, 0],
      [-0.25, 2, -0.25],
      [0, -0.25, 0],
    ]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const centerIdx = (y * width + x) * 4

        for (let c = 0; c < 3; c++) {
          let sum = 0

          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const neighborIdx = ((y + ky) * width + (x + kx)) * 4
              sum += data[neighborIdx + c] * kernel[ky + 1][kx + 1]
            }
          }

          output.data[centerIdx + c] = Math.max(0, Math.min(255, sum))
        }

        output.data[centerIdx + 3] = data[centerIdx + 3] // Alpha
      }
    }

    // Copy edges
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        if (y === 0 || y === height - 1 || x === 0 || x === width - 1) {
          const idx = (y * width + x) * 4
          for (let c = 0; c < 4; c++) {
            output.data[idx + c] = data[idx + c]
          }
        }
      }
    }

    return output
  }

  /**
   * Simple enhancement for backward compatibility
   */
  static async enhanceImage(imageUrl: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) throw new Error("Could not get canvas context")

          canvas.width = img.width
          canvas.height = img.height
          ctx.drawImage(img, 0, 0)

          // Apply basic enhancement
          const enhanced = this.applyAdvancedPostProcessing(canvas)
          resolve(enhanced.toDataURL("image/png", 1.0))
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageUrl
    })
  }
}

// Export convenience functions
export const upscaleImageClient = (imageUrl: string, scaleFactor = 4) =>
  ClientUpscaler.upscaleImage(imageUrl, scaleFactor)

export const enhanceImageClient = (imageUrl: string) => ClientUpscaler.enhanceImage(imageUrl)
