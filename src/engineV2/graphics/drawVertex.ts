import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA, rgbaString } from '@/utils'

const getSize = (point: EditableImagePoint) => {
  if (point.isSelected) { return 5.5 }
  if (point.isHighlighted) { return 5.5 }
  return 3.5
}

export const drawVertexV2 = (
  drawFn: DrawCallback,
  camera: Camera,
  point: EditableImagePoint,
  filter: ImageManipulationFilter | null,
  color: RGBA,
  isSelected: boolean,
  convertCoordinates: boolean = true,
  isOccluded: boolean = false,
  isScaling: boolean = true
): void => {
  if (!isSelected) { return }
  const { x, y } = convertCoordinates
    ? camera.imageViewToCanvasView(point)
    : point

  const pointSize = getSize(point) / (isScaling ? camera.scale : 1)

  drawFn(ctx => {
    if (point.isSelected) {
      ctx.fillStyle = filter ? rgbaString(color, filter.opacity / 100.0) : rgbaString(color)
    } else if (point.isHighlighted) {
      ctx.fillStyle = isOccluded ? 'rgb(100, 100, 100)' : 'rgb(255, 255, 255)'
    } else {
      ctx.fillStyle = isOccluded ? 'rgb(100, 100, 100)' : 'rgb(255, 255, 255)'
    }

    ctx.beginPath()
    ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
    ctx.fill()
    ctx.stroke()
  })
}

/**
 * @deprecated
 */
export const drawVertex = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  point: EditableImagePoint,
  filter: ImageManipulationFilter | null,
  color: RGBA,
  isSelected: boolean,
  convertCoordinates: boolean = true,
  isOccluded: boolean = false
) => {
  if (!isSelected) { return }
  const { x, y } = convertCoordinates
    ? camera.imageViewToCanvasView(point)
    : point

  const pointSize = getSize(point)

  if (point.isSelected) {
    ctx.fillStyle = filter ? rgbaString(color, filter.opacity / 100.0) : rgbaString(color)
  } else if (point.isHighlighted) {
    ctx.fillStyle = isOccluded ? 'rgb(100, 100, 100)' : 'rgb(255, 255, 255)'
  } else {
    ctx.fillStyle = isOccluded ? 'rgb(100, 100, 100)' : 'rgb(255, 255, 255)'
  }

  ctx.beginPath()
  ctx.arc(x, y, pointSize, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
}
