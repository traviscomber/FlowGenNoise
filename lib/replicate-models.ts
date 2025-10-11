// Replicate model configurations for FlowSketch
export const REPLICATE_MODELS = {
  "black-forest-labs/flux-1.1-pro-ultra": {
    name: "FLUX 1.1 Pro Ultra",
    description: "Highest quality, ultra-detailed images with exceptional prompt following",
    version: "latest",
    maxResolution: "4K",
    aspectRatios: ["1:1", "16:9", "21:9", "9:16", "9:21"],
  },
  "black-forest-labs/flux-1.1-pro": {
    name: "FLUX 1.1 Pro",
    description: "Professional quality with fast generation speed",
    version: "latest",
    maxResolution: "2K",
    aspectRatios: ["1:1", "16:9", "21:9", "9:16"],
  },
  "black-forest-labs/flux-schnell": {
    name: "FLUX Schnell",
    description: "Ultra-fast generation for rapid prototyping",
    version: "latest",
    maxResolution: "1K",
    aspectRatios: ["1:1", "16:9", "9:16"],
  },
  "stability-ai/sdxl": {
    name: "Stable Diffusion XL",
    description: "Versatile and reliable image generation",
    version: "latest",
    maxResolution: "1024x1024",
    aspectRatios: ["1:1", "16:9", "9:16"],
  },
  "nvidia/sana": {
    name: "NVIDIA SANA",
    description: "NVIDIA's high-performance 4K image generation model",
    version: "latest",
    maxResolution: "4K",
    aspectRatios: ["1:1", "2:1", "16:9", "21:9"],
  },
} as const

export type ReplicateModelKey = keyof typeof REPLICATE_MODELS
