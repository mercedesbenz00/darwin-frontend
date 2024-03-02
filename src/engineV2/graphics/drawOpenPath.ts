import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint } from '@/engineCommon/point'
import { DrawCallback, DrawFn } from '@/engineV2/models/layers'
import { RGBA } from '@/utils'

import { buildPath2DImageView } from './buildPath2DImageView'
import { drawVertex, drawVertexV2 } from './drawVertex'
import { lineWidth } from './lineWidth'
import { strokeStyle } from './strokeStyle'

export function drawOpenPathV2 (
  drawFn: DrawCallback,
  camera: Camera,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false,
  path2D: Path2D | undefined = undefined
): void {
  drawFn(ctx => {
    ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)

    const openPath = path2D || buildPath2DImageView(path, false)

    ctx.lineWidth = lineWidth(camera) * 1.0 / camera.scale
    ctx.stroke(openPath)
  })

  for (const point of path) {
    drawVertexV2((draw?: DrawFn) => {
      drawFn((ctx, canvas) => {
        ctx.lineJoin = 'round'
        draw?.(ctx, canvas)
      })
    }, camera, point, filter, color, isSelected, false)
  }
}

/**
 * @deprecated
 */
export function drawOpenPath (
  camera: Camera,
  ctx: CanvasRenderingContext2D,
  path: EditableImagePoint[],
  color: RGBA,
  filter: ImageManipulationFilter | null,
  isSelected = false,
  path2D: Path2D | undefined = undefined
): Path2D {
  ctx.strokeStyle = strokeStyle(color, filter, false, isSelected)

  const openPath = path2D || buildPath2DImageView(path, false)

  ctx.save()
  camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.lineWidth = lineWidth(camera) * 1.0 / camera.scale
  ctx.stroke(openPath)
  ctx.restore()

  ctx.lineJoin = 'round'
  for (const point of path) {
    drawVertex(ctx, camera, point, filter, color, isSelected)
  }

  return openPath
}
