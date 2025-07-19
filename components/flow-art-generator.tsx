"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"

interface FlowArtGeneratorProps {
  width?: number
  height?: number
}

const FlowArtGenerator: React.FC<FlowArtGeneratorProps> = ({ width = 500, height = 500 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [colorScheme, setColorScheme] = useState("plasma")
  const [lineCount, setLineCount] = useState(50)
  const [speed, setSpeed] = useState(1)
  const [lineWidth, setLineWidth] = useState(1)
  const [animationId, setAnimationId] = useState<number | null>(null)

  const colorSchemes = [
    // Original palettes
    { value: "plasma", label: "Plasma" },
    { value: "quantum", label: "Quantum" },
    { value: "cosmic", label: "Cosmic" },
    { value: "thermal", label: "Thermal" },
    { value: "spectral", label: "Spectral" },
    { value: "crystalline", label: "Crystalline" },
    { value: "bioluminescent", label: "Bioluminescent" },
    { value: "aurora", label: "Aurora" },
    { value: "metallic", label: "Metallic" },
    { value: "prismatic", label: "Prismatic" },
    { value: "monochromatic", label: "Monochromatic" },
    { value: "infrared", label: "Infrared" },
    { value: "lava", label: "Lava" },
    { value: "futuristic", label: "Futuristic" },
    { value: "forest", label: "Forest" },
    { value: "ocean", label: "Ocean" },
    { value: "sunset", label: "Sunset" },
    { value: "arctic", label: "Arctic" },
    { value: "neon", label: "Neon" },
    { value: "vintage", label: "Vintage" },
    { value: "toxic", label: "Toxic" },
    { value: "ember", label: "Ember" },

    // NEW ARTISTIC PALETTES

    // Mystical & Magical
    { value: "enchanted", label: "Enchanted" },
    { value: "fairy", label: "Fairy" },
    { value: "wizard", label: "Wizard" },
    { value: "potion", label: "Potion" },
    { value: "crystal", label: "Crystal" },

    // Cyberpunk & Sci-Fi
    { value: "cyberpunk", label: "Cyberpunk" },
    { value: "matrix", label: "Matrix" },
    { value: "synthwave", label: "Synthwave" },
    { value: "hologram", label: "Hologram" },
    { value: "android", label: "Android" },

    // Nature & Organic
    { value: "mushroom", label: "Mushroom" },
    { value: "moss", label: "Moss" },
    { value: "coral", label: "Coral" },
    { value: "jade", label: "Jade" },
    { value: "amber", label: "Amber" },

    // Gemstone & Precious
    { value: "ruby", label: "Ruby" },
    { value: "sapphire", label: "Sapphire" },
    { value: "emerald", label: "Emerald" },
    { value: "amethyst", label: "Amethyst" },
    { value: "opal", label: "Opal" },

    // Atmospheric & Weather
    { value: "storm", label: "Storm" },
    { value: "lightning", label: "Lightning" },
    { value: "rainbow", label: "Rainbow" },
    { value: "mist", label: "Mist" },
    { value: "thunder", label: "Thunder" },

    // Artistic & Creative
    { value: "watercolor", label: "Watercolor" },
    { value: "oil_paint", label: "Oil Paint" },
    { value: "pastel", label: "Pastel" },
    { value: "charcoal", label: "Charcoal" },
    { value: "ink", label: "Ink" },

    // Seasonal & Time
    { value: "spring", label: "Spring" },
    { value: "summer", label: "Summer" },
    { value: "autumn", label: "Autumn" },
    { value: "winter", label: "Winter" },
    { value: "dawn", label: "Dawn" },
    { value: "midnight", label: "Midnight" },

    // Emotional & Mood
    { value: "melancholy", label: "Melancholy" },
    { value: "euphoria", label: "Euphoria" },
    { value: "serenity", label: "Serenity" },
    { value: "passion", label: "Passion" },
    { value: "mystery", label: "Mystery" },

    // Cultural & Historical
    { value: "japanese", label: "Japanese" },
    { value: "egyptian", label: "Egyptian" },
    { value: "nordic", label: "Nordic" },
    { value: "aztec", label: "Aztec" },
    { value: "celtic", label: "Celtic" },

    // Abstract & Conceptual
    { value: "void", label: "Void" },
    { value: "infinity", label: "Infinity" },
    { value: "chaos", label: "Chaos" },
    { value: "harmony", label: "Harmony" },
    { value: "balance", label: "Balance" },

    // Elemental
    { value: "fire", label: "Fire" },
    { value: "water", label: "Water" },
    { value: "earth", label: "Earth" },
    { value: "air", label: "Air" },

    // Psychedelic & Trippy
    { value: "psychedelic", label: "Psychedelic" },
    { value: "kaleidoscope", label: "Kaleidoscope" },
    { value: "fractal", label: "Fractal" },
    { value: "dimension", label: "Dimension" },

    // Food & Culinary
    { value: "chocolate", label: "Chocolate" },
    { value: "wine", label: "Wine" },
    { value: "honey", label: "Honey" },
    { value: "mint", label: "Mint" },

    // Architectural & Urban
    { value: "concrete", label: "Concrete" },
    { value: "brick", label: "Brick" },
    { value: "glass", label: "Glass" },
    { value: "steel", label: "Steel" },
  ]

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = width
    canvas.height = height

    let lines: { x: number; y: number; angle: number; length: number }[] = []

    const generateLines = () => {
      lines = []
      for (let i = 0; i < lineCount; i++) {
        lines.push({
          x: Math.random() * width,
          y: Math.random() * height,
          angle: Math.random() * Math.PI * 2,
          length: Math.random() * 50 + 50,
        })
      }
    }

    generateLines()

    const draw = () => {
      if (!ctx) return

      ctx.clearRect(0, 0, width, height)

      lines.forEach((line, index) => {
        const hue = (index / lineCount) * 360
        let color

        switch (colorScheme) {
          case "plasma":
            color = `hsl(${hue}, 100%, 50%)`
            break
          case "quantum":
            color = `hsl(${hue + 180}, 100%, 50%)`
            break
          case "cosmic":
            color = `hsl(${(hue * 2) % 360}, 100%, 50%)`
            break
          case "thermal":
            color = `hsl(${hue / 2}, 100%, 50%)`
            break
          case "spectral":
            color = `hsl(${360 - hue}, 100%, 50%)`
            break
          case "crystalline":
            color = `hsla(${hue}, 80%, 60%, 0.7)`
            break
          case "bioluminescent":
            color = `hsla(${hue + 50}, 90%, 55%, 0.8)`
            break
          case "aurora":
            color = `hsla(${(hue * 1.5) % 360}, 70%, 70%, 0.6)`
            break
          case "metallic":
            color = `hsla(${hue / 3}, 60%, 80%, 0.5)`
            break
          case "prismatic":
            color = `hsla(${360 - hue * 0.75}, 95%, 65%, 0.9)`
            break
          case "monochromatic":
            const gray = Math.floor((hue / 360) * 100)
            color = `hsl(0, 0%, ${gray}%)`
            break
          case "infrared":
            color = `hsl(${hue + 30}, 85%, 45%)`
            break
          case "lava":
            color = `hsl(${hue / 4}, 95%, 40%)`
            break
          case "futuristic":
            color = `hsl(${360 - hue * 0.6}, 75%, 75%)`
            break
          case "forest":
            color = `hsl(${hue / 5 + 120}, 70%, 35%)`
            break
          case "ocean":
            color = `hsl(${hue / 6 + 180}, 80%, 40%)`
            break
          case "sunset":
            color = `hsl(${hue / 7 + 30}, 90%, 50%)`
            break
          case "arctic":
            color = `hsl(${hue / 8 + 200}, 60%, 85%)`
            break
          case "neon":
            color = `hsl(${(hue * 3) % 360}, 100%, 60%)`
            break
          case "vintage":
            color = `hsl(${hue / 9 + 40}, 50%, 60%)`
            break
          case "toxic":
            color = `hsl(${((hue * 4) % 360) + 90}, 90%, 45%)`
            break
          case "ember":
            color = `hsl(${hue / 10}, 95%, 55%)`
            break
          // NEW ARTISTIC PALETTES
          case "enchanted":
            color = `hsla(${((hue * 0.8) % 360) + 30}, 80%, 70%, 0.7)`
            break
          case "fairy":
            color = `hsla(${((hue * 0.9) % 360) + 60}, 90%, 80%, 0.8)`
            break
          case "wizard":
            color = `hsla(${((hue * 1.1) % 360) + 90}, 70%, 60%, 0.9)`
            break
          case "potion":
            color = `hsla(${((hue * 1.2) % 360) + 120}, 85%, 55%, 0.6)`
            break
          case "crystal":
            color = `hsla(${((hue * 1.3) % 360) + 150}, 95%, 65%, 0.7)`
            break
          // Cyberpunk & Sci-Fi
          case "cyberpunk":
            color = `hsla(${((hue * 1.4) % 360) + 180}, 75%, 75%, 0.8)`
            break
          case "matrix":
            color = `hsla(${((hue * 1.5) % 360) + 210}, 85%, 45%, 0.9)`
            break
          case "synthwave":
            color = `hsla(${((hue * 1.6) % 360) + 240}, 95%, 55%, 0.7)`
            break
          case "hologram":
            color = `hsla(${((hue * 1.7) % 360) + 270}, 65%, 85%, 0.6)`
            break
          case "android":
            color = `hsla(${((hue * 1.8) % 360) + 300}, 70%, 65%, 0.8)`
            break
          // Nature & Organic
          case "mushroom":
            color = `hsla(${((hue * 1.9) % 360) + 330}, 80%, 35%, 0.9)`
            break
          case "moss":
            color = `hsla(${((hue * 2.0) % 360) + 0}, 90%, 40%, 0.7)`
            break
          case "coral":
            color = `hsla(${((hue * 2.1) % 360) + 30}, 70%, 50%, 0.8)`
            break
          case "jade":
            color = `hsla(${((hue * 2.2) % 360) + 60}, 85%, 60%, 0.6)`
            break
          case "amber":
            color = `hsla(${((hue * 2.3) % 360) + 90}, 95%, 70%, 0.9)`
            break
          // Gemstone & Precious
          case "ruby":
            color = `hsla(${((hue * 2.4) % 360) + 120}, 75%, 45%, 0.7)`
            break
          case "sapphire":
            color = `hsla(${((hue * 2.5) % 360) + 150}, 85%, 55%, 0.8)`
            break
          case "emerald":
            color = `hsla(${((hue * 2.6) % 360) + 180}, 95%, 65%, 0.9)`
            break
          case "amethyst":
            color = `hsla(${((hue * 2.7) % 360) + 210}, 65%, 75%, 0.6)`
            break
          case "opal":
            color = `hsla(${((hue * 2.8) % 360) + 240}, 70%, 85%, 0.7)`
            break
          // Atmospheric & Weather
          case "storm":
            color = `hsla(${((hue * 2.9) % 360) + 270}, 80%, 40%, 0.8)`
            break
          case "lightning":
            color = `hsla(${((hue * 3.0) % 360) + 300}, 90%, 50%, 0.9)`
            break
          case "rainbow":
            color = `hsla(${((hue * 3.1) % 360) + 330}, 70%, 60%, 0.7)`
            break
          case "mist":
            color = `hsla(${((hue * 3.2) % 360) + 0}, 85%, 70%, 0.6)`
            break
          case "thunder":
            color = `hsla(${((hue * 3.3) % 360) + 30}, 95%, 35%, 0.8)`
            break
          // Artistic & Creative
          case "watercolor":
            color = `hsla(${((hue * 3.4) % 360) + 60}, 75%, 80%, 0.9)`
            break
          case "oil_paint":
            color = `hsla(${((hue * 3.5) % 360) + 90}, 85%, 45%, 0.7)`
            break
          case "pastel":
            color = `hsla(${((hue * 3.6) % 360) + 120}, 95%, 85%, 0.6)`
            break
          case "charcoal":
            color = `hsla(${((hue * 3.7) % 360) + 150}, 65%, 30%, 0.8)`
            break
          case "ink":
            color = `hsla(${((hue * 3.8) % 360) + 180}, 70%, 40%, 0.9)`
            break
          // Seasonal & Time
          case "spring":
            color = `hsla(${((hue * 3.9) % 360) + 210}, 80%, 70%, 0.7)`
            break
          case "summer":
            color = `hsla(${((hue * 4.0) % 360) + 240}, 90%, 80%, 0.8)`
            break
          case "autumn":
            color = `hsla(${((hue * 4.1) % 360) + 270}, 70%, 60%, 0.9)`
            break
          case "winter":
            color = `hsla(${((hue * 4.2) % 360) + 300}, 85%, 55%, 0.6)`
            break
          case "dawn":
            color = `hsla(${((hue * 4.3) % 360) + 330}, 95%, 65%, 0.7)`
            break
          case "midnight":
            color = `hsla(${((hue * 4.4) % 360) + 0}, 75%, 35%, 0.8)`
            break
          // Emotional & Mood
          case "melancholy":
            color = `hsla(${((hue * 4.5) % 360) + 30}, 85%, 45%, 0.9)`
            break
          case "euphoria":
            color = `hsla(${((hue * 4.6) % 360) + 60}, 95%, 55%, 0.7)`
            break
          case "serenity":
            color = `hsla(${((hue * 4.7) % 360) + 90}, 65%, 85%, 0.6)`
            break
          case "passion":
            color = `hsla(${((hue * 4.8) % 360) + 120}, 70%, 75%, 0.8)`
            break
          case "mystery":
            color = `hsla(${((hue * 4.9) % 360) + 150}, 80%, 30%, 0.9)`
            break
          // Cultural & Historical
          case "japanese":
            color = `hsla(${((hue * 5.0) % 360) + 180}, 90%, 40%, 0.7)`
            break
          case "egyptian":
            color = `hsla(${((hue * 5.1) % 360) + 210}, 70%, 50%, 0.8)`
            break
          case "nordic":
            color = `hsla(${((hue * 5.2) % 360) + 240}, 85%, 60%, 0.6)`
            break
          case "aztec":
            color = `hsla(${((hue * 5.3) % 360) + 270}, 95%, 70%, 0.9)`
            break
          case "celtic":
            color = `hsla(${((hue * 5.4) % 360) + 300}, 75%, 45%, 0.7)`
            break
          // Abstract & Conceptual
          case "void":
            color = `hsla(${((hue * 5.5) % 360) + 330}, 85%, 55%, 0.8)`
            break
          case "infinity":
            color = `hsla(${((hue * 5.6) % 360) + 0}, 95%, 65%, 0.9)`
            break
          case "chaos":
            color = `hsla(${((hue * 5.7) % 360) + 30}, 65%, 75%, 0.6)`
            break
          case "harmony":
            color = `hsla(${((hue * 5.8) % 360) + 60}, 70%, 85%, 0.7)`
            break
          case "balance":
            color = `hsla(${((hue * 5.9) % 360) + 90}, 80%, 30%, 0.8)`
            break
          // Elemental
          case "fire":
            color = `hsla(${((hue * 6.0) % 360) + 120}, 90%, 40%, 0.9)`
            break
          case "water":
            color = `hsla(${((hue * 6.1) % 360) + 150}, 70%, 50%, 0.7)`
            break
          case "earth":
            color = `hsla(${((hue * 6.2) % 360) + 180}, 85%, 60%, 0.8)`
            break
          case "air":
            color = `hsla(${((hue * 6.3) % 360) + 210}, 95%, 70%, 0.6)`
            break
          // Psychedelic & Trippy
          case "psychedelic":
            color = `hsla(${((hue * 6.4) % 360) + 240}, 75%, 45%, 0.7)`
            break
          case "kaleidoscope":
            color = `hsla(${((hue * 6.5) % 360) + 270}, 85%, 55%, 0.8)`
            break
          case "fractal":
            color = `hsla(${((hue * 6.6) % 360) + 300}, 95%, 65%, 0.9)`
            break
          case "dimension":
            color = `hsla(${((hue * 6.7) % 360) + 330}, 65%, 75%, 0.6)`
            break
          // Food & Culinary
          case "chocolate":
            color = `hsla(${((hue * 6.8) % 360) + 0}, 70%, 85%, 0.7)`
            break
          case "wine":
            color = `hsla(${((hue * 6.9) % 360) + 30}, 80%, 30%, 0.8)`
            break
          case "honey":
            color = `hsla(${((hue * 7.0) % 360) + 60}, 90%, 40%, 0.9)`
            break
          case "mint":
            color = `hsla(${((hue * 7.1) % 360) + 90}, 70%, 50%, 0.7)`
            break
          // Architectural & Urban
          case "concrete":
            color = `hsla(${((hue * 7.2) % 360) + 120}, 85%, 60%, 0.8)`
            break
          case "brick":
            color = `hsla(${((hue * 7.3) % 360) + 150}, 95%, 70%, 0.6)`
            break
          case "glass":
            color = `hsla(${((hue * 7.4) % 360) + 180}, 75%, 45%, 0.7)`
            break
          case "steel":
            color = `hsla(${((hue * 7.5) % 360) + 210}, 85%, 55%, 0.8)`
            break
          default:
            color = `hsl(${hue}, 100%, 50%)`
        }

        ctx.beginPath()
        ctx.strokeStyle = color
        ctx.lineWidth = lineWidth
        ctx.moveTo(line.x, line.y)
        ctx.lineTo(line.x + Math.cos(line.angle) * line.length, line.y + Math.sin(line.angle) * line.length)
        ctx.stroke()

        line.x += Math.cos(line.angle) * speed
        line.y += Math.sin(line.angle) * speed

        if (line.x < 0 || line.x > width || line.y < 0 || line.y > height) {
          line.x = Math.random() * width
          line.y = Math.random() * height
        }
      })

      setAnimationId(requestAnimationFrame(draw))
    }

    setAnimationId(requestAnimationFrame(draw))

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [colorScheme, lineCount, speed, lineWidth, width, height])

  const handleColorSchemeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setColorScheme(e.target.value)
  }

  const handleLineCountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineCount(Number.parseInt(e.target.value))
  }

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number.parseFloat(e.target.value))
  }

  const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineWidth(Number.parseFloat(e.target.value))
  }

  return (
    <div>
      <canvas ref={canvasRef} />
      <div>
        <label htmlFor="colorScheme">Color Scheme:</label>
        <select id="colorScheme" value={colorScheme} onChange={handleColorSchemeChange}>
          {colorSchemes.map((scheme) => (
            <option key={scheme.value} value={scheme.value}>
              {scheme.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="lineCount">Line Count:</label>
        <input type="number" id="lineCount" value={lineCount} onChange={handleLineCountChange} />
      </div>
      <div>
        <label htmlFor="speed">Speed:</label>
        <input type="number" id="speed" value={speed} onChange={handleSpeedChange} step="0.1" />
      </div>
      <div>
        <label htmlFor="lineWidth">Line Width:</label>
        <input type="number" id="lineWidth" value={lineWidth} onChange={handleLineWidthChange} step="0.1" />
      </div>
    </div>
  )
}

export default FlowArtGenerator
