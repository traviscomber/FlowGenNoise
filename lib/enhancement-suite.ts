// Image Enhancement Suite - Professional image processing tools
export class ImageEnhancementSuite {
  private canvas: HTMLCanvasElement
  private ctx: CanvasRenderingContext2D
  private originalImageData: ImageData | null = null

  constructor() {
    this.canvas = document.createElement("canvas")
    const context = this.canvas.getContext("2d")
    if (!context) {
      throw new Error("Could not get canvas context")
    }
    this.ctx = context
  }

  async loadImage(imageDataUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = "anonymous"

      img.onload = () => {
        this.canvas.width = img.width
        this.canvas.height = img.height
        this.ctx.drawImage(img, 0, 0)
        this.originalImageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height)
        resolve()
      }

      img.onerror = () => reject(new Error("Failed to load image"))
      img.src = imageDataUrl
    })
  }

  // Brightness adjustment
  adjustBrightness(value: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, data[i] + value)) // Red
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + value)) // Green
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + value)) // Blue
    }

    this.ctx.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Contrast adjustment
  adjustContrast(value: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const factor = (259 * (value + 255)) / (255 * (259 - value))
    const data = imageData.data

    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.max(0, Math.min(255, factor * (data[i] - 128) + 128))
      data[i + 1] = Math.max(0, Math.min(255, factor * (data[i + 1] - 128) + 128))
      data[i + 2] = Math.max(0, Math.min(255, factor * (data[i + 2] - 128) + 128))
    }

    this.ctx.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Saturation adjustment
  adjustSaturation(value: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    const saturation = value / 100

    for (let i = 0; i < data.length; i += 4) {
      const r = data[i]
      const g = data[i + 1]
      const b = data[i + 2]

      const gray = 0.299 * r + 0.587 * g + 0.114 * b

      data[i] = Math.max(0, Math.min(255, gray + saturation * (r - gray)))
      data[i + 1] = Math.max(0, Math.min(255, gray + saturation * (g - gray)))
      data[i + 2] = Math.max(0, Math.min(255, gray + saturation * (b - gray)))
    }

    this.ctx.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Sharpening filter
  applySharpen(intensity = 1): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)

    // Sharpening kernel
    const kernel = [0, -intensity, 0, -intensity, 1 + 4 * intensity, -intensity, 0, -intensity, 0]

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          let sum = 0
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              sum += data[idx] * kernel[(ky + 1) * 3 + (kx + 1)]
            }
          }
          const outputIdx = (y * width + x) * 4 + c
          output.data[outputIdx] = Math.max(0, Math.min(255, sum))
        }
        const alphaIdx = (y * width + x) * 4 + 3
        output.data[alphaIdx] = data[alphaIdx]
      }
    }

    this.ctx.putImageData(output, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Blur filter
  applyBlur(radius: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    this.ctx.putImageData(imageData, 0, 0)
    this.ctx.filter = `blur(${radius}px)`
    this.ctx.drawImage(this.canvas, 0, 0)
    this.ctx.filter = "none"

    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Noise reduction
  applyNoiseReduction(): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const output = new ImageData(width, height)

    // Simple median filter for noise reduction
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        for (let c = 0; c < 3; c++) {
          const values = []
          for (let ky = -1; ky <= 1; ky++) {
            for (let kx = -1; kx <= 1; kx++) {
              const idx = ((y + ky) * width + (x + kx)) * 4 + c
              values.push(data[idx])
            }
          }
          values.sort((a, b) => a - b)
          const outputIdx = (y * width + x) * 4 + c
          output.data[outputIdx] = values[4] // median value
        }
        const alphaIdx = (y * width + x) * 4 + 3
        output.data[alphaIdx] = data[alphaIdx]
      }
    }

    this.ctx.putImageData(output, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Color temperature adjustment
  adjustColorTemperature(temperature: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    const temp = temperature / 100

    for (let i = 0; i < data.length; i += 4) {
      if (temp > 0) {
        // Warmer (more red/yellow)
        data[i] = Math.min(255, data[i] + temp * 30) // Red
        data[i + 1] = Math.min(255, data[i + 1] + temp * 15) // Green
      } else {
        // Cooler (more blue)
        data[i + 2] = Math.min(255, data[i + 2] + Math.abs(temp) * 30) // Blue
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Vignette effect
  applyVignette(intensity: number): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    const imageData = new ImageData(
      new Uint8ClampedArray(this.originalImageData.data),
      this.originalImageData.width,
      this.originalImageData.height,
    )

    const data = imageData.data
    const width = imageData.width
    const height = imageData.height
    const centerX = width / 2
    const centerY = height / 2
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY)

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)
        const vignette = 1 - (distance / maxDistance) * intensity
        const idx = (y * width + x) * 4

        data[idx] *= vignette // Red
        data[idx + 1] *= vignette // Green
        data[idx + 2] *= vignette // Blue
      }
    }

    this.ctx.putImageData(imageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Reset to original
  reset(): string {
    if (!this.originalImageData) throw new Error("No image loaded")

    this.ctx.putImageData(this.originalImageData, 0, 0)
    return this.canvas.toDataURL("image/png", 1.0)
  }

  // Get current image as data URL
  getCurrentImage(): string {
    return this.canvas.toDataURL("image/png", 1.0)
  }
}
