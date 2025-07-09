interface CloudinaryUploadOptions {
  folder?: string
  public_id?: string
  tags?: string[]
}

interface CloudinaryResponse {
  public_id: string
  secure_url: string
  width: number
  height: number
  format: string
  bytes: number
}

export async function uploadImageToCloudinary(
  imageData: string,
  options: CloudinaryUploadOptions = {},
): Promise<CloudinaryResponse> {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary configuration missing")
  }

  // Convert base64 to blob if needed
  const formData = new FormData()

  if (imageData.startsWith("data:")) {
    formData.append("file", imageData)
  } else {
    formData.append("file", imageData)
  }

  formData.append("upload_preset", uploadPreset)

  if (options.folder) {
    formData.append("folder", options.folder)
  }

  if (options.public_id) {
    formData.append("public_id", options.public_id)
  }

  if (options.tags && options.tags.length > 0) {
    formData.append("tags", options.tags.join(","))
  }

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Cloudinary upload failed: ${error}`)
  }

  const result = await response.json()
  return result
}

export async function uploadUpscaledImageToCloudinary(
  imageData: string,
  originalPublicId: string,
  scaleFactor: number,
): Promise<CloudinaryResponse> {
  const upscaledPublicId = `${originalPublicId}_upscaled_${scaleFactor}x`

  return uploadImageToCloudinary(imageData, {
    folder: "flowsketch-generations/upscaled",
    public_id: upscaledPublicId,
    tags: ["flowsketch", "upscaled", `${scaleFactor}x`],
  })
}

export function getCloudinaryUrl(publicId: string, transformations?: string): string {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  if (!cloudName) {
    throw new Error("Cloudinary cloud name not configured")
  }

  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`

  if (transformations) {
    return `${baseUrl}/${transformations}/${publicId}`
  }

  return `${baseUrl}/${publicId}`
}

export function getUpscaledCloudinaryUrl(publicId: string): string {
  return getCloudinaryUrl(publicId, "e_upscale")
}
