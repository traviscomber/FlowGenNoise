import { v2 as cloudinary } from "cloudinary"

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

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

export async function uploadImageToCloudinary(
  imageData: string,
  options: {
    folder?: string
    public_id?: string
    tags?: string[]
    transformation?: any
  } = {},
): Promise<CloudinaryUploadResult> {
  try {
    const result = await cloudinary.uploader.upload(imageData, {
      folder: options.folder || "flowsketch-generations",
      public_id: options.public_id,
      tags: options.tags || ["flowsketch", "generated-art"],
      resource_type: "image",
      transformation: options.transformation,
      quality: "auto:best",
      format: "png",
    })

    return {
      public_id: result.public_id,
      secure_url: result.secure_url,
      width: result.width,
      height: result.height,
      format: result.format,
      resource_type: result.resource_type,
      created_at: result.created_at,
      bytes: result.bytes,
    }
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error)
    throw new Error("Failed to upload image to Cloudinary")
  }
}

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

export function generateCloudinaryUrl(publicId: string, transformations: any = {}): string {
  return cloudinary.url(publicId, {
    secure: true,
    quality: "auto:best",
    fetch_format: "auto",
    ...transformations,
  })
}

export async function deleteImageFromCloudinary(publicId: string): Promise<void> {
  try {
    await cloudinary.uploader.destroy(publicId)
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error)
    throw new Error("Failed to delete image from Cloudinary")
  }
}
