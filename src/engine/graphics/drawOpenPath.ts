import { View } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { RGBA } from '@/utils'

import { buildPath2DImageView } from './buildPath2DImageView'
import { drawVertex } from './drawVertex'
import { lineWidth } from './lineWidth'
import { strokeStyle } from './strokeStyle'

export function drawOpenPath (
  view: View,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false,
  path2D: Path2D | undefined = undefined
) {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)

  const openPath = path2D || buildPath2DImageView(path, false)

  ctx.save()
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.lineWidth = lineWidth(view.camera) * 1.0 / view.camera.scale
  ctx.stroke(openPath)
  ctx.restore()

  ctx.lineJoin = 'round'
  for (const point of path) {
    drawVertex(ctx, view.camera, point, filter, color, isSelected)
  }

  return openPath
}
