import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { ImagePoint, Point } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

const tipHalfWidth = 5
const tipHalfHeight = 8

export function drawVectorV2 (
  drawFn: DrawCallback,
  camera: Camera,
  centroid: Point<any>,
  vector: {angle: number, length: number},
  color: RGBA,
  filter: ImageManipulationFilter | null,
  scale: number = camera.scale
): void {
  drawFn(ctx => {
    ctx.save()
    const tip = centroid.add(
      new Point<'Image'>({
        x: vector.length * Math.cos(vector.angle),
        y: vector.length * Math.sin(vector.angle)
      })
    )
    const canvasCentroid = centroid
    const canvasTip = tip

    ctx.strokeStyle = filter ? rgbaString(color, filter.borderOpacity / 100.0) : rgbaString(color)
    ctx.fillStyle = filter ? rgbaString(color, filter.opacity / 100.0) : rgbaString(color)
    ctx.lineWidth = camera.lineWidth / scale
    ctx.lineJoin = 'round'

    // Draw line
    ctx.beginPath()
    ctx.moveTo(canvasCentroid.x, canvasCentroid.y)
    ctx.lineTo(canvasTip.x, canvasTip.y)
    ctx.stroke()

    // Draw tip
    const halfWidth = tipHalfWidth / scale
    const halfHeight = tipHalfHeight / scale

    ctx.translate(canvasTip.x, canvasTip.y)
    ctx.rotate(vector.angle + Math.PI / 2)
    ctx.moveTo(0, 0)
    ctx.lineTo(halfWidth, halfHeight)
    ctx.lineTo(-halfWidth, halfHeight)
    ctx.closePath()
    ctx.fill()
    ctx.restore()
  })
}

/**
 * @deprecated
 */
export function drawVector (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  centroid: ImagePoint,
  vector: {angle: number, length: number},
  color: RGBA,
  filter: ImageManipulationFilter | null
): void {
  const tip = centroid.add(
    new Point<'Image'>({
      x: vector.length * Math.cos(vector.angle),
      y: vector.length * Math.sin(vector.angle)
    })
  )
  const canvasCentroid = camera.imageViewToCanvasView(centroid)
  const canvasTip = camera.imageViewToCanvasView(tip)

  ctx.strokeStyle = filter ? rgbaString(color, filter.borderOpacity / 100.0) : rgbaString(color)
  ctx.fillStyle = filter ? rgbaString(color, filter.borderOpacity / 100.0) : rgbaString(color)
  ctx.lineWidth = camera.lineWidth
  ctx.lineJoin = 'round'

  ctx.save()

  // Draw line
  ctx.beginPath()
  ctx.moveTo(canvasCentroid.x, canvasCentroid.y)
  ctx.lineTo(canvasTip.x, canvasTip.y)
  ctx.stroke()

  // Draw tip
  ctx.translate(canvasTip.x, canvasTip.y)
  ctx.rotate(vector.angle + Math.PI / 2)
  ctx.moveTo(0, 0)
  ctx.lineTo(5, 8)
  ctx.lineTo(-5, 8)
  ctx.closePath()
  ctx.fill()

  ctx.restore()
}
