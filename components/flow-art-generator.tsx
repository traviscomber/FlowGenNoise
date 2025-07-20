"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

const datasets = [
  // Attractors & Chaotic Systems
  { value: "lorenz", label: "Lorenz Attractor" },
  { value: "rossler", label: "Rössler Attractor" },
  { value: "henon", label: "Hénon Map" },
  { value: "clifford", label: "Clifford Attractor" },
  { value: "ikeda", label: "Ikeda Map" },
  { value: "tinkerbell", label: "Tinkerbell Map" },
  { value: "gingerbread", label: "Gingerbread Map" },
  { value: "duffing", label: "Duffing Oscillator" },
  { value: "chua", label: "Chua's Circuit" },
  { value: "halvorsen", label: "Halvorsen Attractor" },
  { value: "aizawa", label: "Aizawa Attractor" },
  { value: "thomas", label: "Thomas Attractor" },
  { value: "dadras", label: "Dadras Attractor" },
  { value: "chen", label: "Chen Attractor" },
  { value: "rabinovich", label: "Rabinovich-Fabrikant" },
  { value: "sprott", label: "Sprott Attractor" },
  { value: "fourwing", label: "Four-Wing Attractor" },

  // Fractals
  { value: "mandelbrot", label: "Mandelbrot Set" },
  { value: "julia", label: "Julia Set" },
  { value: "newton", label: "Newton Fractal" },
  { value: "burning", label: "Burning Ship" },
  { value: "tricorn", label: "Tricorn" },
  { value: "multibrot", label: "Multibrot Set" },
  { value: "phoenix", label: "Phoenix Fractal" },
  { value: "barnsley", label: "Barnsley Fern" },
  { value: "sierpinski", label: "Sierpinski Triangle" },
  { value: "dragon", label: "Dragon Curve" },
  { value: "hilbert", label: "Hilbert Curve" },
  { value: "koch", label: "Koch Snowflake" },
  { value: "lsystem", label: "L-System" },

  // Cellular Automata
  { value: "cellular", label: "Cellular Automata" },
  { value: "gameoflife", label: "Game of Life" },

  // Reaction-Diffusion Systems
  { value: "diffusion", label: "Reaction-Diffusion" },
  { value: "turing", label: "Turing Patterns" },
  { value: "gray-scott", label: "Gray-Scott Model" },
  { value: "belousov", label: "Belousov-Zhabotinsky" },
  { value: "fitzhugh", label: "FitzHugh-Nagumo" },
  { value: "hodgkin", label: "Hodgkin-Huxley" },

  // Wave & Field Equations
  { value: "wave", label: "Wave Interference" },
  { value: "kuramoto", label: "Kuramoto-Sivashinsky" },
  { value: "navier", label: "Navier-Stokes" },
  { value: "schrodinger", label: "Schrödinger Equation" },
  { value: "klein", label: "Klein-Gordon" },
  { value: "sine-gordon", label: "Sine-Gordon" },
  { value: "kdv", label: "Korteweg-de Vries" },
  { value: "burgers", label: "Burgers Equation" },
  { value: "heat", label: "Heat Equation" },
  { value: "laplace", label: "Laplace Equation" },
  { value: "poisson", label: "Poisson Equation" },
  { value: "helmholtz", label: "Helmholtz Equation" },

  // Geometric & Noise
  { value: "spirals", label: "Fibonacci Spirals" },
  { value: "fractal", label: "Fractal Trees" },
  { value: "voronoi", label: "Voronoi Diagram" },
  { value: "perlin", label: "Perlin Noise" },
]

const FlowArtGenerator = () => {
  const [selectedDataset, setSelectedDataset] = useState(datasets[0].value)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Example drawing logic (replace with actual algorithm based on selectedDataset)
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "black"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    ctx.font = "20px Arial"
    ctx.fillText(`Selected: ${selectedDataset}`, 50, 50)
  }, [selectedDataset])

  const handleDatasetChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataset(event.target.value)
  }

  return (
    <div>
      <h1>Flow Art Generator</h1>
      <select value={selectedDataset} onChange={handleDatasetChange}>
        {datasets.map((dataset) => (
          <option key={dataset.value} value={dataset.value}>
            {dataset.label}
          </option>
        ))}
      </select>
      <canvas ref={canvasRef} width={800} height={600} style={{ border: "1px solid black" }}></canvas>
    </div>
  )
}

export default FlowArtGenerator
export { FlowArtGenerator }
