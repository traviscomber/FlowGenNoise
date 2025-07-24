// lib/plot-utils.ts
// This file would contain utility functions for plotting,
// such as canvas manipulation, color mapping, etc.
// For brevity, the actual implementation is omitted,
// but it would typically involve functions to:
// - Draw pixels on a canvas based on computed values
// - Apply color gradients
// - Handle transformations (e.g., stereographic projection)

export function drawFlowArt(
  canvas: HTMLCanvasElement,
  data: number[][], // Example: 2D array of computed values
  colorScheme: string,
  stereographic: boolean,
) {
  const ctx = canvas.getContext("2d")
  if (!ctx) {
    console.error("Could not get 2D context for canvas.")
    return
  }

  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.createImageData(width, height)
  const pixels = imageData.data

  // Placeholder for color mapping logic
  const getColor = (value: number, scheme: string) => {
    // This is a simplified placeholder. In a real app, this would map
    // the 'value' (e.g., iteration count, Lyapunov exponent) to an RGB color
    // based on the selected 'scheme'.
    // For demonstration, let's use a simple grayscale or a fixed color.
    let r, g, b
    if (scheme === "plasma") {
      r = Math.floor(Math.sin(value * 0.1) * 127 + 128)
      g = Math.floor(Math.sin(value * 0.1 + 2) * 127 + 128)
      b = Math.floor(Math.sin(value * 0.1 + 4) * 127 + 128)
    } else if (scheme === "viridis") {
      r = Math.floor(Math.sin(value * 0.05) * 100 + 150)
      g = Math.floor(Math.cos(value * 0.07) * 100 + 150)
      b = Math.floor(Math.sin(value * 0.09) * 100 + 150)
    } else {
      // Default to grayscale
      const gray = Math.floor(value * 255)
      r = g = b = gray
    }
    return [r, g, b, 255] // RGBA
  }

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const index = y * width + x
      const value = data[y]?.[x] || 0 // Get value from data array

      let displayX = x
      let displayY = y

      if (stereographic) {
        // Simple placeholder for stereographic projection.
        // In a real implementation, this would involve complex number math
        // to project points from a sphere to a plane.
        // For now, let's just apply a slight distortion.
        const centerX = width / 2
        const centerY = height / 2
        const dx = x - centerX
        const dy = y - centerY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const factor = 1 + dist / (Math.min(width, height) * 2) // Simple distortion factor
        displayX = centerX + dx * factor
        displayY = centerY + dy * factor

        // Ensure coordinates are within bounds
        if (displayX < 0 || displayX >= width || displayY < 0 || displayY >= height) {
          continue // Skip pixels outside the canvas after projection
        }
      }

      const [r, g, b, a] = getColor(value, colorScheme)

      // Set pixel data (clamping to integer coordinates for displayX, displayY)
      const targetIndex = (Math.floor(displayY) * width + Math.floor(displayX)) * 4
      if (targetIndex >= 0 && targetIndex + 3 < pixels.length) {
        pixels[targetIndex] = r
        pixels[targetIndex + 1] = g
        pixels[targetIndex + 2] = b
        pixels[targetIndex + 3] = a
      }
    }
  }

  ctx.putImageData(imageData, 0, 0)
}

export function getCanvasImageBlob(canvas: HTMLCanvasElement): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob)
    }, "image/png")
  })
}

export function getCanvasImageDataURL(canvas: HTMLCanvasElement): string {
  return canvas.toDataURL("image/png")
}
