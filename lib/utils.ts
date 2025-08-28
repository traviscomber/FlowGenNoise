import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs))
}

// Utility function to format file sizes
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes"

  const k = 1024
  const sizes = ["Bytes", "KB", "MB", "GB"]
  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
}

// Utility function to generate random seeds
export function generateSeed(): number {
  return Math.floor(Math.random() * 10000)
}

// Utility function to validate image URLs
export function isValidImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === "http:" || urlObj.protocol === "https:"
  } catch {
    return false
  }
}

// Utility function to download files
export function downloadFile(url: string, filename: string): void {
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.style.display = "none"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Utility function to convert data URL to blob
export function dataURLToBlob(dataURL: string): Blob {
  const arr = dataURL.split(",")
  const mime = arr[0].match(/:(.*?);/)![1]
  const bstr = atob(arr[1])
  let n = bstr.length
  const u8arr = new Uint8Array(n)

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n)
  }

  return new Blob([u8arr], { type: mime })
}

// Utility function to resize images while maintaining aspect ratio
export function calculateAspectRatioFit(
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  maxHeight: number,
): { width: number; height: number } {
  const ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight)

  return {
    width: srcWidth * ratio,
    height: srcHeight * ratio,
  }
}

// Utility function to debounce function calls
export function debounce<T extends (...args: any[]) => any>(func: T, wait: number): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

// Utility function to throttle function calls
export function throttle<T extends (...args: any[]) => any>(func: T, limit: number): (...args: Parameters<T>) => void {
  let inThrottle: boolean

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

// Safe image compression utility for production
export async function compressImage(file: File, quality = 0.8): Promise<File> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas element
      const canvas = document.createElement("canvas")
      const ctx = canvas.getContext("2d")

      if (!ctx) {
        reject(new Error("Canvas context not available"))
        return
      }

      // Create image element
      const img = new Image()

      img.onload = () => {
        try {
          // Set canvas dimensions
          canvas.width = img.width
          canvas.height = img.height

          // Draw image to canvas
          ctx.drawImage(img, 0, 0)

          // Convert to blob with compression
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name, {
                  type: file.type,
                  lastModified: Date.now(),
                })
                resolve(compressedFile)
              } else {
                reject(new Error("Failed to compress image"))
              }
            },
            file.type,
            quality,
          )
        } catch (error) {
          reject(error)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image"))
      }

      // Load image
      img.src = URL.createObjectURL(file)
    } catch (error) {
      reject(error)
    }
  })
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/tiff"]
  const maxSize = 50 * 1024 * 1024 // 50MB

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Unsupported file type. Please use JPG, PNG, WebP, HEIC, or TIFF.",
    }
  }

  if (file.size > maxSize) {
    return {
      valid: false,
      error: "File too large. Maximum size is 50MB.",
    }
  }

  return { valid: true }
}
