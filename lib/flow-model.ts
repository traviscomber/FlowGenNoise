/**
 * FlowSketch - mathematical dataset generator + scenario catalogue
 *
 * 1.  SCENARIOS – list of creative overlays (incl. background colours)
 * 2.  generateDataset(...) – pure-function that returns an array of 2-D points
 * 3.  FlowModel class – OO wrapper used by FlowArtGenerator (static helpers)
 *
 * NOTE: this is intentionally lightweight (no heavy math deps) but produces
 * visually interesting distributions good enough for demos / testing.
 */

/* ---------- 1. Scenario catalogue ---------- */
export const SCENARIOS = {
  none: { label: "None", backgroundColor: "#ffffff" },
  forest: { label: "Enchanted Forest", backgroundColor: "#183a1d" },
  ocean: { label: "Deep Ocean", backgroundColor: "#012b52" },
  space: { label: "Cosmic Nebula", backgroundColor: "#0b0d17" },
  city: { label: "Cyberpunk City", backgroundColor: "#1a001a" },
} as const

/* ---------- 2. Simple deterministic PRNG ---------- */
function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/* ---------- 3. Dataset generators ---------- */
type Point = { x: number; y: number }

function genSpirals(n: number, rng: () => number, noise = 0.01): Point[] {
  const points: Point[] = []
  const turns = 5
  for (let i = 0; i < n; i++) {
    const r = i / n
    const angle = turns * 2 * Math.PI * r
    points.push({
      x: r * Math.cos(angle) + (rng() - 0.5) * noise,
      y: r * Math.sin(angle) + (rng() - 0.5) * noise,
    })
  }
  return points
}

function genMoons(n: number, rng: () => number, noise = 0.05): Point[] {
  const points: Point[] = []
  for (let i = 0; i < n; i++) {
    const angle = Math.PI * rng()
    const radius = 0.5 + (rng() - 0.5) * noise
    const offset = i < n / 2 ? 0 : 0.55 // split into two half-circles
    points.push({ x: Math.cos(angle) * radius + offset, y: Math.sin(angle) * radius })
  }
  return points
}

function genCheckerboard(n: number, rng: () => number): Point[] {
  const side = Math.ceil(Math.sqrt(n))
  const points: Point[] = []
  for (let i = 0; i < n; i++) {
    points.push({
      x: (i % side) / side + 0.5 / side,
      y: Math.floor(i / side) / side + 0.5 / side,
    })
  }
  return points
}

function genGaussian(n: number, rng: () => number, noise = 0.08): Point[] {
  const points: Point[] = []
  const gaussian = () => {
    // Box-Muller
    const u = 1 - rng()
    const v = 1 - rng()
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  for (let i = 0; i < n; i++) {
    points.push({ x: gaussian() * noise, y: gaussian() * noise })
  }
  return points
}

function genGrid(n: number): Point[] {
  const side = Math.ceil(Math.sqrt(n))
  const points: Point[] = []
  for (let row = 0; row < side; row++) {
    for (let col = 0; col < side; col++) {
      points.push({ x: col / (side - 1), y: row / (side - 1) })
    }
  }
  return points.slice(0, n)
}

function genNeural(n: number, rng: () => number): Point[] {
  // “Neural” pattern – sinusoidal band
  const points: Point[] = []
  for (let i = 0; i < n; i++) {
    const t = (i / n) * 4 * Math.PI
    points.push({
      x: t / (4 * Math.PI),
      y: 0.5 + Math.sin(t * 2) * 0.3 + (rng() - 0.5) * 0.05,
    })
  }
  return points
}

/* ---------- 4. Public API ---------- */
export function generateDataset(
  dataset: string,
  seed = 42,
  numSamples = 1000,
  noise = 0.05,
  scenario?: keyof typeof SCENARIOS,
): Point[] {
  const rng = mulberry32(seed)
  switch (dataset) {
    case "spirals":
    case "spiral":
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
    case "neural":
      return genNeural(numSamples, rng)
    default:
      // fallback to gaussian
      return genGaussian(numSamples, rng, noise)
  }
}

/**
 * OO wrapper used by FlowArtGenerator (kept for backwards compatibility)
 */
export class FlowModel {
  static generateDataset = generateDataset
}
