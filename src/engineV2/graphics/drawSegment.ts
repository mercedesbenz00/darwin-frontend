import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA } from '@/utils'

import { strokeStyle } from './strokeStyle'

export function drawSegmentV2 (
  drawFn: DrawCallback,
  camera: Camera,
  p1: EditableImagePoint,
  p2: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected: boolean = false
): void {
  drawFn(ctx => {
    ctx.lineWidth = camera.lineWidth * 1.0 / camera.scale
    ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
    ctx.beginPath()
    ctx.moveTo(p1.x, p1.y)
    ctx.lineTo(p2.x, p2.y)
    ctx.stroke()
  })
}

/**
 * @deprecated
 */
export function drawSegment (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  p1: EditableImagePoint,
  p2: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected: boolean = false
): void {
  ctx.save()
  camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.lineWidth = camera.lineWidth * 1.0 / camera.scale
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
  ctx.restore()
}
