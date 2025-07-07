/**
 * A simple seeded pseudo-random number generator (PRNG).
 * Not cryptographically secure, but sufficient for reproducible dataset generation.
 */
function createPrng(seed: number) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function generateDataset(name: string, seed: number): number[][] {
  const prng = createPrng(seed)
  const n_samples = 1000
  const noise = 0.05

  if (name === "spirals") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const theta = Math.sqrt(prng()) * 2 * Math.PI
      const r = 2 * theta
      const x = r * Math.cos(theta)
      const y = r * Math.sin(theta)
      data.push([x, y])
    }
    return data
  } else if (name === "checkerboard") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const x = Math.floor(prng() * 4 - 2) + prng()
      const y = Math.floor(prng() * 4 - 2) + prng()
      data.push([x, y])
    }
    return data
  } else if (name === "moons") {
    // Simplified implementation of make_moons, aiming for similar visual output
    const X: number[][] = []

    for (let i = 0; i < n_samples / 2; i++) {
      const angle = (Math.PI * i) / (n_samples / 2 - 1)
      X.push([Math.cos(angle) + (prng() * 2 - 1) * noise, Math.sin(angle) + (prng() * 2 - 1) * noise])
    }
    for (let i = 0; i < n_samples / 2; i++) {
      const angle = (Math.PI * i) / (n_samples / 2 - 1) + Math.PI
      X.push([1 - Math.cos(angle) + (prng() * 2 - 1) * noise, 1 - Math.sin(angle) + (prng() * 2 - 1) * noise])
    }
    return X
  } else if (name === "gaussian") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      // Using Box-Muller transform for Gaussian distribution
      const u1 = prng()
      const u2 = prng()
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)
      const z2 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2)
      data.push([z1 * 0.5, z2 * 0.5]) // Scale down for better visualization
    }
    return data
  } else if (name === "grid") {
    const data: number[][] = []
    const numPointsPerSide = Math.floor(Math.sqrt(n_samples))
    const step = 2 / (numPointsPerSide - 1) // Grid from -1 to 1
    for (let i = 0; i < numPointsPerSide; i++) {
      for (let j = 0; j < numPointsPerSide; j++) {
        data.push([-1 + i * step, -1 + j * step])
      }
    }
    return data
  }
  // Default to random noise if name is not recognized
  return Array.from({ length: n_samples }, () => [prng() * 2 - 1, prng() * 2 - 1])
}
