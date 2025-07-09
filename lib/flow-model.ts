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

export function generateDataset(name: string, seed: number, n_samples: number, noise: number): number[][] {
  const prng = createPrng(seed)

  if (name === "spirals") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const theta = Math.sqrt(prng()) * 2 * Math.PI
      const r = 2 * theta
      const x = r * Math.cos(theta) + (prng() * 2 - 1) * noise
      const y = r * Math.sin(theta) + (prng() * 2 - 1) * noise
      data.push([x, y])
    }
    return data
  } else if (name === "checkerboard") {
    const data: number[][] = []
    for (let i = 0; i < n_samples; i++) {
      const x = Math.floor(prng() * 4 - 2) + (prng() * 2 - 1) * noise
      const y = Math.floor(prng() * 4 - 2) + (prng() * 2 - 1) * noise
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
      data.push([z1 * 0.5 + (prng() * 2 - 1) * noise, z2 * 0.5 + (prng() * 2 - 1) * noise]) // Scale down for better visualization
    }
    return data
  } else if (name === "grid") {
    const data: number[][] = []
    const numPointsPerSide = Math.floor(Math.sqrt(n_samples))
    const step = 2 / (numPointsPerSide - 1) // Grid from -1 to 1
    for (let i = 0; i < numPointsPerSide; i++) {
      for (let j = 0; j < numPointsPerSide; j++) {
        data.push([-1 + i * step + (prng() * 2 - 1) * noise, -1 + j * step + (prng() * 2 - 1) * noise])
      }
    }
    return data
  } else if (name === "neural") {
    // Neural network-inspired dataset with interconnected nodes and layers
    const data: number[][] = []
    const layers = 4
    const nodesPerLayer = Math.ceil(n_samples / layers)

    for (let layer = 0; layer < layers; layer++) {
      const layerX = (layer / (layers - 1)) * 4 - 2 // Spread layers from -2 to 2
      const nodesInThisLayer = Math.min(nodesPerLayer, n_samples - layer * nodesPerLayer)

      for (let node = 0; node < nodesInThisLayer; node++) {
        // Create vertical distribution of nodes in each layer
        const nodeY = (node / Math.max(1, nodesInThisLayer - 1)) * 3 - 1.5 // Spread from -1.5 to 1.5

        // Add some organic variation to make it look more neural
        const organicX = layerX + Math.sin(node * 0.5 + layer) * 0.3
        const organicY = nodeY + Math.cos(node * 0.7 + layer) * 0.2

        // Add noise and random connections
        const finalX = organicX + (prng() * 2 - 1) * noise
        const finalY = organicY + (prng() * 2 - 1) * noise

        data.push([finalX, finalY])

        // Add some "synaptic" connections as additional points
        if (layer < layers - 1 && prng() > 0.7) {
          const connectionX = layerX + (prng() * 0.8 + 0.1) // Partial connection to next layer
          const connectionY = nodeY + (prng() * 0.4 - 0.2)
          data.push([connectionX + (prng() * 2 - 1) * noise, connectionY + (prng() * 2 - 1) * noise])
        }
      }
    }

    // Trim to exact sample count
    return data.slice(0, n_samples)
  }
  // Default to random noise if name is not recognized
  return Array.from({ length: n_samples }, () => [prng() * 2 - 1, prng() * 2 - 1])
}
