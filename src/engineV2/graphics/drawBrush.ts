import { Polygon } from 'polybooljs'

import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

import { strokeStyle } from './strokeStyle'

const getPatternCanvas = (
  dotWidth: number,
  dotDistance: number,
  color: string
): HTMLCanvasElement => {
  const patternCanvas = document.createElement('canvas')
  patternCanvas.width = patternCanvas.height = dotWidth + dotDistance

  const ctx = patternCanvas.getContext('2d')
  if (!ctx) { throw new Error('Unable to get 2d context for pattern canvas (brush fill)') }

  ctx.fillStyle = color
  ctx.beginPath()
  ctx.arc(dotWidth / 2, dotWidth / 2, dotWidth / 2, 0, Math.PI * 2, false)
  ctx.closePath()
  ctx.fill()
  ctx.rotate(45)

  return patternCanvas
}

export const drawBrushV2 = (
  drawFn: DrawCallback,
  camera: Camera,
  brush: Polygon,
  color: RGBA,
  filter: ImageManipulationFilter | null
): void => {
  drawFn(ctx => {
    if (brush.regions.length === 0) { return }

    const stroke = strokeStyle(color, filter, false, false)

    ctx.lineWidth = camera.lineWidth
    ctx.strokeStyle = stroke

    const patternCanvas = getPatternCanvas(2, 5, stroke)
    const pattern = ctx.createPattern(patternCanvas, 'repeat')

    if (pattern) {
      const matrix = new DOMMatrix()
      pattern.setTransform(matrix.rotate(-45))
      ctx.fillStyle = pattern
    } else {
      ctx.fillStyle = rgbaString(color, 0.15)
    }

    const cameraOffset = camera.getOffset()

    ctx.beginPath()
    for (const path of brush.regions) {
      const [x, y] = path[0]
      ctx.moveTo(x * camera.scale - cameraOffset.x, y * camera.scale - cameraOffset.y)
      for (let i = 1; i < path.length; i++) {
        const [x, y] = path[i]
        ctx.lineTo(x * camera.scale - cameraOffset.x, y * camera.scale - cameraOffset.y)
      }
      ctx.closePath()
    }

    ctx.stroke()
    ctx.fill('evenodd')
  })
}

/**
 * @deprecated
 */
export const drawBrush = (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  brush: Polygon,
  color: RGBA,
  filter: ImageManipulationFilter | null
): void => {
  if (brush.regions.length === 0) { return }

  const stroke = strokeStyle(color, filter, false, false)

  ctx.lineWidth = camera.lineWidth
  ctx.strokeStyle = stroke

  const patternCanvas = getPatternCanvas(2, 5, stroke)
  const pattern = ctx.createPattern(patternCanvas, 'repeat')

  if (pattern) {
    const matrix = new DOMMatrix()
    pattern.setTransform(matrix.rotate(-45))
    ctx.fillStyle = pattern
  } else {
    ctx.fillStyle = rgbaString(color, 0.15)
  }

  const cameraOffset = camera.getOffset()

  ctx.beginPath()
  for (const path of brush.regions) {
    const [x, y] = path[0]
    ctx.moveTo(x * camera.scale - cameraOffset.x, y * camera.scale - cameraOffset.y)
    for (let i = 1; i < path.length; i++) {
      const [x, y] = path[i]
      ctx.lineTo(x * camera.scale - cameraOffset.x, y * camera.scale - cameraOffset.y)
    }
    ctx.closePath()
  }

  ctx.stroke()
  ctx.fill('evenodd')
}
