/**
 * FlowSketch – *minimal* fallback version
 * -----------------------------------------------------------
 * This file defines the public helpers that the rest of the app
 * expects (`generateFlowField` and `generateDomeProjection`).
 *
 * NOTE:  • The SVG that is produced here is purposely simple –
 *          enough to unblock the compilation error while you
 *          continue iterating on the real maths / plotting code.
 *        • Feel free to replace the bodies with your advanced
 *          algorithms later; just keep the function signatures.
 */

export interface GenerationParams {
  dataset: string
  scenario: string
  colorScheme: string
  seed: number
  numSamples: number
  noiseScale: number
  timeStep: number
  domeProjection?: boolean
  domeDiameter?: number
  domeResolution?: string
  projectionType?: string
}

/* ------------------------------------------------------------------ */
/*  Colour palettes (kept – many parts of the UI reference them)      */
/* ------------------------------------------------------------------ */

export const colorPalettes = {
  plasma: ["#0D001A", "#7209B7", "#F72585", "#FFBE0B"],
  quantum: ["#001122", "#0066FF", "#00FFAA", "#FFD700"],
  cosmic: ["#000000", "#4B0082", "#9370DB", "#FFFFFF"],
  thermal: ["#000080", "#FF4500", "#FFD700", "#FFFFFF"],
  spectral: ["#8B00FF", "#0000FF", "#00FF00", "#FFFF00"],
  crystalline: ["#E6E6FA", "#4169E1", "#00CED1", "#FFFFFF"],
  bioluminescent: ["#000080", "#008B8B", "#00FF7F", "#ADFF2F"],
  aurora: ["#191970", "#00CED1", "#7FFF00", "#FFD700"],
  metallic: ["#B87333", "#C0C0C0", "#FFD700", "#E5E4E2"],
  prismatic: ["#FF0000", "#FF7F00", "#FFFF00", "#00FF00"],
  monochromatic: ["#000000", "#404040", "#808080", "#FFFFFF"],
  infrared: ["#8B0000", "#FF4500", "#FF6347", "#FFA500"],
  lava: ["#1A0000", "#8B0000", "#FF4500", "#FFD700"],
  futuristic: ["#001122", "#00FFFF", "#0080FF", "#FFFFFF"],
  forest: ["#0F1B0F", "#228B22", "#32CD32", "#90EE90"],
  ocean: ["#000080", "#0066CC", "#00BFFF", "#E0F6FF"],
  sunset: ["#2D1B69", "#FF6B35", "#F7931E", "#FFD23F"],
  arctic: ["#1E3A8A", "#60A5FA", "#E0F2FE", "#FFFFFF"],
  neon: ["#000000", "#FF00FF", "#00FF00", "#FFFF00"],
  vintage: ["#8B4513", "#CD853F", "#F4A460", "#FFF8DC"],
  toxic: ["#1A1A00", "#66FF00", "#CCFF00", "#FFFF99"],
  ember: ["#2D0A00", "#CC4400", "#FF8800", "#FFCC66"],
} as const

/* ------------------------------------------------------------------ */
/*  Helper that picks a colour based on index                          */
/* ------------------------------------------------------------------ */
function paletteColor(palette: readonly string[], idx: number): string {
  return palette[idx % palette.length]
}

/* ------------------------------------------------------------------ */
/*  Public API                                                         */
/* ------------------------------------------------------------------ */

/**
 * generateFlowField - basic spirals placeholder
 * Returns an SVG string that the UI can preview.
 */
export function generateFlowField(params: GenerationParams): string {
  const size = 512
  const colours = colorPalettes[params.colorScheme as keyof typeof colorPalettes] ?? colorPalettes.plasma

  // Create a VERY simple multi-arm spiral so we know something renders
  const arms = 5
  const turns = 8
  const pathParts: string[] = []

  for (let a = 0; a < arms; a++) {
    let path = `M ${size / 2} ${size / 2}`
    for (let t = 0; t <= 1; t += 1 / (params.numSamples || 2000)) {
      const angle = turns * 2 * Math.PI * t + (a * 2 * Math.PI) / arms
      const radius = t * (size / 2) * 0.85
      const x = size / 2 + radius * Math.cos(angle)
      const y = size / 2 + radius * Math.sin(angle)
      path += ` L ${x.toFixed(2)} ${y.toFixed(2)}`
    }
    pathParts.push(
      `<path d="${path}" fill="none" stroke="${paletteColor(colours, a)}" stroke-width="1" stroke-opacity="0.8"/>`,
    )
  }

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="${colours[0]}" />
      ${pathParts.join("\n")}
    </svg>
  `
}

/**
 * generateDomeProjection – placeholder fisheye render.
 * For now we simply wrap the regular field in a circle mask so it
 * *looks* hemispherical.  Proper fisheye maths can be plugged in later.
 */
export function generateDomeProjection(params: GenerationParams): string {
  const base = generateFlowField(params) // reuse the field

  // Strip outer <svg> tags from base so we can embed as <defs>/<use>
  const inner = base.replace(/^<svg[^>]*>|<\/svg>$/g, "")
  const size = 512

  return `
    <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="hemisphere">
          <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" />
        </clipPath>
      </defs>
      <g clip-path="url(#hemisphere)">
        ${inner}
      </g>
    </svg>
  `
}
