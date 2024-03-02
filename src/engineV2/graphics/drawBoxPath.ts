import { Camera } from '@/engineCommon/camera'
import { DrawCallback } from '@/engineV2/models/layers'

import { lineWidth } from './lineWidth'

export const drawBoxPathV2 = (
  drawFn: DrawCallback,
  camera: Camera,
  boxPath: Path2D,
  inferred: boolean
): void => drawFn(ctx => {
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = lineWidth(camera, inferred) * 1.0 / camera.scale
  ctx.strokeStyle = 'rgb(241, 245, 249)' // Alice Blue
  ctx.stroke(boxPath)
})

/**
 * @deprecated
 */
export const drawBoxPath = (
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  boxPath: Path2D,
  inferred: boolean
): void => {
  ctx.save()
  camera.imageViewCtxToCanvasViewCtx(ctx)
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
  ctx.lineWidth = lineWidth(camera, inferred) * 1.0 / camera.scale
  ctx.strokeStyle = 'rgb(241, 245, 249)' // Alice Blue
  ctx.stroke(boxPath)
  ctx.restore()
}
