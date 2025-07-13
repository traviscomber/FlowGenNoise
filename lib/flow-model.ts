/**
 * FlowSketch – lightweight mathematical dataset generator
 *
 * Provides:
 *   • SCENARIOS – palette of background colours (used by UI)
 *   • generateDataset(...) – returns an array of { x, y } points
 *   • FlowModel.generateDataset – wrapper for legacy code paths
 */

export interface Point {
  x: number
  y: number
}

/* -------------------------------------------------------------------------- */
/* 1. Creative scenario catalogue (UI can read background colours if desired) */
/* -------------------------------------------------------------------------- */
export const SCENARIOS = {
  none: { label: "None", backgroundColor: "#ffffff" },
  forest: { label: "Enchanted Forest", backgroundColor: "#183a1d" },
  ocean: { label: "Deep Ocean", backgroundColor: "#012b52" },
  space: { label: "Cosmic Nebula", backgroundColor: "#0b0d17" },
  city: { label: "Cyberpunk City", backgroundColor: "#1a001a" },
} as const

/* -------------------------------------------------------------------------- */
/* 2. Small deterministic PRNG (Mulberry32)                                   */
/* -------------------------------------------------------------------------- */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* -------------------------------------------------------------------------- */
/* 3. Individual pattern generators                                           */
/* -------------------------------------------------------------------------- */
function genSpirals(n: number, rng: () => number, noise = 0.01): Point[] {
  // two-armed spiral
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const r = i / n
    const angle = 4 * Math.PI * r // two full turns
    pts.push({
      x: r * Math.cos(angle) + (rng() - 0.5) * noise,
      y: r * Math.sin(angle) + (rng() - 0.5) * noise,
    })
  }
  return pts
}

function genMoons(n: number, rng: () => number, noise = 0.05): Point[] {
  const pts: Point[] = []
  const half = Math.floor(n / 2)

  // upper moon
  for (let i = 0; i < half; i++) {
    const angle = Math.PI * rng()
    pts.push({
      x: Math.cos(angle) + (rng() - 0.5) * noise,
      y: Math.sin(angle) + (rng() - 0.5) * noise,
    })
  }

  // lower moon (offset)
  for (let i = 0; i < n - half; i++) {
    const angle = Math.PI * rng()
    pts.push({
      x: 1 - Math.cos(angle) + (rng() - 0.5) * noise,
      y: -Math.sin(angle) + 0.5 + (rng() - 0.5) * noise,
    })
  }
  return pts
}

function genCheckerboard(n: number, rng: () => number): Point[] {
  const size = Math.ceil(Math.sqrt(n))
  const pts: Point[] = []
  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      if (pts.length >= n) break
      pts.push({ x: col, y: row })
    }
  }
  return pts
}

function genGaussian(n: number, rng: () => number, noise = 0.08): Point[] {
  const pts: Point[] = []
  const gaussian = () => {
    // Box-Muller transform
    const u = 1 - rng()
    const v = 1 - rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  for (let i = 0; i < n; i++) {
    pts.push({ x: gaussian() * noise, y: gaussian() * noise })
  }
  return pts
}

function genGrid(n: number): Point[] {
  const side = Math.ceil(Math.sqrt(n))
  const pts: Point[] = []
  for (let r = 0; r < side; r++) {
    for (let c = 0; c < side; c++) {
      if (pts.length >= n) break
      pts.push({ x: c / (side - 1), y: r / (side - 1) })
    }
  }
  return pts
}

function genNeural(n: number, rng: () => number): Point[] {
  // sinusoid “ridge” pattern
  const pts: Point[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 4 * Math.PI
    pts.push({
      x: t / (4 * Math.PI),
      y: 0.5 + Math.sin(t * 2) * 0.3 + (rng() - 0.5) * 0.05,
    })
  }
  return pts
}

/* -------------------------------------------------------------------------- */
/* 4. Public generator – used across the app                                  */
/* -------------------------------------------------------------------------- */
export function generateDataset(dataset: string, seed = 42, numSamples = 1000, noise = 0.05): Point[] {
  const rng = mulberry32(seed)
  switch (dataset) {
    case "spiral":
    case "spirals":
      return genSpirals(numSamples, rng, noise)
    case "moons":
      return genMoons(numSamples, rng, noise)
    case "checkerboard":
      return genCheckerboard(numSamples, rng)
    case "gaussian":
    case "blobs":
      return genGaussian(numSamples, rng, noise)
    case "grid":
      return genGrid(numSamples)
    case "neural": // Added neural case
      return genNeural(numSamples, rng)
    default:
      return genGaussian(numSamples, rng, noise)
  }
}

/* -------------------------------------------------------------------------- */
/* 5. Wrapper class (legacy API the UI already imports)                       */
/* -------------------------------------------------------------------------- */
export class FlowModel {
  static generateDataset = generateDataset
}
