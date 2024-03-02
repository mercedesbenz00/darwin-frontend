import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA } from '@/utils'

import { strokeStyle } from './strokeStyle'

export function drawSegment (
  view: IView,
  p1: EditableImagePoint,
  p2: EditableImagePoint,
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected: boolean = false
): void {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  ctx.save()
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.lineWidth = view.camera.lineWidth * 1.0 / view.camera.scale
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)
  ctx.beginPath()
  ctx.moveTo(p1.x, p1.y)
  ctx.lineTo(p2.x, p2.y)
  ctx.stroke()
  ctx.restore()
}
