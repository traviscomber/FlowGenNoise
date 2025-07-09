/**
 * Cloudinary REST helpers (SDK-free).
 *
 * This version avoids the Node “crypto.createHash” issue by using Cloudinary’s
 * unsigned upload preset workflow.  Make sure you have an unsigned preset and
 * the env var  NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET  available (already in
 * this project’s env list).
 *
 * Required env vars (server-side):
 *   CLOUDINARY_CLOUD_NAME
 *   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
 */

export interface CloudinaryUploadResult {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  bytes: number
}

const CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME
const UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

if (!CLOUD_NAME || !UPLOAD_PRESET) {
  console.warn("[cloudinary-utils] CLOUDINARY_CLOUD_NAME or NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET is missing.")
}

/**
 * Low-level unsigned upload.
 * Accepts a base64 data URL or an https URL in `imageData`.
 */
export async function uploadImageToCloudinary(
  imageData: string,
  options: {
    folder?: string
    public_id?: string
    tags?: string[]
  } = {},
): Promise<CloudinaryUploadResult> {
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    throw new Error("Cloudinary environment variables are not configured.")
  }

  const endpoint = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()

  formData.append("file", imageData)
  formData.append("upload_preset", UPLOAD_PRESET)

  if (options.folder) formData.append("folder", options.folder)
  if (options.public_id) formData.append("public_id", options.public_id)
  if (options.tags?.length) formData.append("tags", options.tags.join(","))

  const res = await fetch(endpoint, {
    method: "POST",
    body: formData,
  })

  if (!res.ok) {
    const err = await res.text()
    console.error("Cloudinary upload failed:", err)
    throw new Error("Failed to upload image to Cloudinary")
  }

  return (await res.json()) as CloudinaryUploadResult
}

/**
 * Convenience helper for storing upscaled images.
 */
export async function uploadUpscaledImageToCloudinary(
  imageData: string,
  originalPublicId: string,
  scaleFactor = 4,
): Promise<CloudinaryUploadResult> {
  const upscaledPublicId = `${originalPublicId}_upscaled_${scaleFactor}x`
  return uploadImageToCloudinary(imageData, {
    folder: "flowsketch-generations/upscaled",
    public_id: upscaledPublicId,
    tags: ["flowsketch", "upscaled", `${scaleFactor}x`],
  })
}

/**
 * Build a Cloudinary delivery URL for an already-uploaded asset.
 * Useful if you want to apply on-the-fly transformations.
 */
export function generateCloudinaryUrl(publicId: string, transformations = ""): string {
  if (!CLOUD_NAME) return ""

  // Example: transformations = "q_auto,f_auto,w_800"
  return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformations}/${publicId}`
}
