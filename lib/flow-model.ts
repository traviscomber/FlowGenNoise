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
    // Neural network dataset based on mathematical activation functions and network topology
    const data: number[][] = []

    for (let i = 0; i < n_samples; i++) {
      // Generate input values using uniform distribution
      const input1 = prng() * 4 - 2 // Range [-2, 2]
      const input2 = prng() * 4 - 2 // Range [-2, 2]

      // Simulate a simple 3-layer neural network with mathematical transformations
      // Layer 1: Input layer (identity function)
      const layer1_out1 = input1
      const layer1_out2 = input2

      // Layer 2: Hidden layer with ReLU-like activation and weighted connections
      const w1 = 0.7,
        w2 = 0.3,
        w3 = -0.5,
        w4 = 0.8 // Fixed weights for reproducibility
      const hidden1 = Math.max(0, w1 * layer1_out1 + w2 * layer1_out2) // ReLU activation
      const hidden2 = Math.max(0, w3 * layer1_out1 + w4 * layer1_out2) // ReLU activation

      // Layer 3: Output layer with sigmoid-like activation
      const w5 = 0.6,
        w6 = -0.4
      const output1 = 2 / (1 + Math.exp(-(w5 * hidden1 + w6 * hidden2))) - 1 // Tanh-like, range [-1, 1]
      const output2 = Math.sin(hidden1 * 0.5) * Math.cos(hidden2 * 0.5) // Sinusoidal combination

      // Apply mathematical transformations to create neural-like patterns
      const x = output1 + Math.sin(input1 * 0.8) * 0.3 + (prng() * 2 - 1) * noise
      const y = output2 + Math.cos(input2 * 0.8) * 0.3 + (prng() * 2 - 1) * noise

      data.push([x, y])
    }

    return data
  }
  // Default to random noise if name is not recognized
  return Array.from({ length: n_samples }, () => [prng() * 2 - 1, prng() * 2 - 1])
}
