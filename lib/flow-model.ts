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
    // Advanced neural network-inspired dataset with realistic brain-like architecture
    const data: number[][] = []

    // Define neural network architecture with varying layer sizes (mimicking real networks)
    const layerSizes = [
      Math.floor(n_samples * 0.15), // Input layer (15%)
      Math.floor(n_samples * 0.35), // Hidden layer 1 (35% - largest)
      Math.floor(n_samples * 0.25), // Hidden layer 2 (25%)
      Math.floor(n_samples * 0.15), // Hidden layer 3 (15%)
      Math.floor(n_samples * 0.1), // Output layer (10% - smallest)
    ]

    // Adjust to match exact sample count
    const totalAllocated = layerSizes.reduce((sum, size) => sum + size, 0)
    const remaining = n_samples - totalAllocated
    layerSizes[1] += remaining // Add remainder to largest hidden layer

    const layers = layerSizes.length
    let currentSampleIndex = 0

    for (let layer = 0; layer < layers; layer++) {
      const layerSize = layerSizes[layer]
      const layerX = (layer / (layers - 1)) * 6 - 3 // Spread layers from -3 to 3 for better spacing

      // Create different node arrangements for different layer types
      for (let node = 0; node < layerSize; node++) {
        let nodeY: number

        if (layerSize === 1) {
          // Single node (centered)
          nodeY = 0
        } else {
          // Multiple nodes distributed vertically
          nodeY = (node / (layerSize - 1)) * 4 - 2 // Spread from -2 to 2
        }

        // Add organic brain-like clustering and variation
        const clusterInfluence = Math.sin(node * 0.3 + layer * 0.7) * 0.4
        const organicX = layerX + clusterInfluence + Math.sin(node * 0.8 + layer * 1.2) * 0.2
        const organicY = nodeY + Math.cos(node * 0.6 + layer * 0.9) * 0.3 + clusterInfluence * 0.5

        // Add dendrite-like branching patterns
        const branchingX = organicX + Math.sin(node * 2.1 + layer * 1.7) * 0.15
        const branchingY = organicY + Math.cos(node * 1.9 + layer * 2.3) * 0.15

        // Apply noise for natural variation
        const finalX = branchingX + (prng() * 2 - 1) * noise
        const finalY = branchingY + (prng() * 2 - 1) * noise

        data.push([finalX, finalY])

        // Add synaptic connections and axon terminals
        if (layer < layers - 1) {
          const connectionProbability = 0.3 + prng() * 0.4 // 30-70% connection rate

          if (prng() < connectionProbability) {
            // Create connection points between current and next layer
            const nextLayerX = ((layer + 1) / (layers - 1)) * 6 - 3
            const connectionProgress = prng() * 0.7 + 0.15 // 15-85% along the connection

            const synapseX = layerX + (nextLayerX - layerX) * connectionProgress
            const synapseY = nodeY + (prng() * 0.6 - 0.3) // Slight vertical variation

            // Add synaptic terminal with organic shape
            const terminalX = synapseX + Math.sin(node * 3.2 + layer * 2.1) * 0.1
            const terminalY = synapseY + Math.cos(node * 2.8 + layer * 1.9) * 0.1

            data.push([terminalX + (prng() * 2 - 1) * noise * 0.5, terminalY + (prng() * 2 - 1) * noise * 0.5])
          }

          // Add dendritic branches (input connections)
          if (prng() > 0.6) {
            const branchLength = prng() * 0.3 + 0.1
            const branchAngle = prng() * Math.PI * 2

            const dendriteTipX = finalX + Math.cos(branchAngle) * branchLength
            const dendriteTipY = finalY + Math.sin(branchAngle) * branchLength

            data.push([dendriteTipX + (prng() * 2 - 1) * noise * 0.3, dendriteTipY + (prng() * 2 - 1) * noise * 0.3])
          }
        }

        // Add axon terminals for output layer
        if (layer === layers - 1 && prng() > 0.5) {
          const axonLength = prng() * 0.4 + 0.2
          const axonX = finalX + axonLength
          const axonY = finalY + (prng() * 0.2 - 0.1)

          data.push([axonX + (prng() * 2 - 1) * noise * 0.4, axonY + (prng() * 2 - 1) * noise * 0.4])
        }

        currentSampleIndex++
        if (currentSampleIndex >= n_samples) break
      }

      if (currentSampleIndex >= n_samples) break
    }

    // Trim to exact sample count and add any remaining as neural noise/glial cells
    while (data.length < n_samples) {
      const randomX = prng() * 6 - 3 + (prng() * 2 - 1) * noise
      const randomY = prng() * 4 - 2 + (prng() * 2 - 1) * noise
      data.push([randomX, randomY])
    }

    return data.slice(0, n_samples)
  }
  // Default to random noise if name is not recognized
  return Array.from({ length: n_samples }, () => [prng() * 2 - 1, prng() * 2 - 1])
}
