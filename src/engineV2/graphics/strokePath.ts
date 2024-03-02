import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableCanvasPoint, EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

export function strokePathV2 (
  drawFn: DrawCallback,
  camera: Camera,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false
): void {
  drawFn(ctx => {
    ctx.lineWidth = camera.lineWidth / camera.scale
    if (filter) {
      ctx.strokeStyle = rgbaString(
        color,
        isSelected ? (filter.borderOpacity / 100.0) : (filter.borderOpacity / 100.0 * 0.5)
      )
    } else {
      ctx.strokeStyle = rgbaString(color, isSelected ? 1 : 0.5)
    }

    ctx.beginPath()
    path.forEach((point, i) => {
      if (i === 0) {
        ctx.moveTo(point.x, point.y)
      } else {
        ctx.lineTo(point.x, point.y)
      }
    })
    ctx.closePath()
    ctx.stroke()

    ctx.lineJoin = 'round'
    ctx.lineWidth = camera.lineWidth / camera.scale
    for (const point of path) {
      if (isSelected) {
        let pointSize = 3.5
        if (point.isSelected) {
          pointSize = 5.5
          ctx.fillStyle = filter ? rgbaString(color, filter.opacity) : rgbaString(color)
        } else if (point.isHighlighted) {
          pointSize = 5.5
          ctx.fillStyle = 'rgb(255, 255, 255)'
        } else {
          pointSize = 3.5
          ctx.fillStyle = 'rgb(255, 255, 255)'
        }
        ctx.beginPath()
        ctx.arc(point.x, point.y, pointSize / camera.scale, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()
        ctx.closePath()
      }
    }
  })
}

/**
 * @deprecated
 */
export function strokePath (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false
): void {
  ctx.lineWidth = camera.lineWidth
  if (filter) {
    ctx.strokeStyle = rgbaString(
      color,
      isSelected ? (filter.borderOpacity / 100.0) : (filter.borderOpacity / 100.0 * 0.5)
    )
  } else {
    ctx.strokeStyle = rgbaString(color, isSelected ? 1 : 0.5)
  }

  ctx.beginPath()
  path.forEach((point, i) => {
    const canvasPoint = camera.imageViewToCanvasView(point) as EditableCanvasPoint
    if (i === 0) {
      ctx.moveTo(canvasPoint.x, canvasPoint.y)
    } else {
      ctx.lineTo(canvasPoint.x, canvasPoint.y)
    }
  })
  ctx.closePath()
  ctx.stroke()

  ctx.lineJoin = 'round'
  ctx.lineWidth = camera.lineWidth
  for (const point of path) {
    // if (!point.editable) continue
    const canvasPoint = camera.imageViewToCanvasView(point) as EditableCanvasPoint
    if (isSelected) {
      let pointSize = 3.5
      if (point.isSelected) {
        pointSize = 5.5
        ctx.fillStyle = filter ? rgbaString(color, filter.opacity) : rgbaString(color)
      } else if (point.isHighlighted) {
        pointSize = 5.5
        ctx.fillStyle = 'rgb(255, 255, 255)'
      } else {
        pointSize = 3.5
        ctx.fillStyle = 'rgb(255, 255, 255)'
      }
      ctx.beginPath()
      ctx.arc(canvasPoint.x, canvasPoint.y, pointSize, 0, 2 * Math.PI)
      ctx.fill()
      ctx.stroke()
      ctx.closePath()
    }
  }
}
