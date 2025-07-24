import type { FlowFieldPoint } from "./flow-model"

export function drawFlowField(
  ctx: CanvasRenderingContext2D,
  points: FlowFieldPoint[],
  width: number,
  height: number,
  showConnections: boolean,
  showGrid: boolean,
) {
  ctx.clearRect(0, 0, width, height)

  // Sort points by depth for correct rendering order (far to near)
  points.sort((a, b) => a.depth - b.depth)

  // Draw grid if enabled
  if (showGrid) {
    drawGrid(ctx, width, height)
  }

  // Draw connections if enabled
  if (showConnections) {
    drawConnections(ctx, points, width, height)
  }

  // Draw points
  for (const point of points) {
    const x = point.position.x + width / 2
    const y = point.position.y + height / 2
    const size = 2 + point.depth * 2 // Scale size by depth for perspective

    ctx.beginPath()
    ctx.arc(x, y, size, 0, Math.PI * 2)
    ctx.fillStyle = point.color
    ctx.fill()
  }
}

function drawConnections(ctx: CanvasRenderingContext2D, points: FlowFieldPoint[], width: number, height: number) {
  ctx.strokeStyle = "rgba(150, 150, 150, 0.2)"
  ctx.lineWidth = 0.5

  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const p1 = points[i]
      const p2 = points[j]

      const dist = p1.position.distanceTo(p2.position)
      if (dist < 50) {
        // Only connect close points
        ctx.beginPath()
        ctx.moveTo(p1.position.x + width / 2, p1.position.y + height / 2)
        ctx.lineTo(p2.position.x + width / 2, p2.position.y + height / 2)
        ctx.stroke()
      }
    }
  }
}

function drawGrid(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.strokeStyle = "rgba(200, 200, 200, 0.1)"
  ctx.lineWidth = 0.5

  const gridSize = 50 // pixels per grid cell

  // Vertical lines
  for (let x = 0; x <= width; x += gridSize) {
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, height)
    ctx.stroke()
  }

  // Horizontal lines
  for (let y = 0; y <= height; y += gridSize) {
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(width, y)
    ctx.stroke()
  }
}
