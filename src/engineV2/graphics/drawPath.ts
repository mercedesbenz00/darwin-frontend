import { Camera } from '@/engineCommon/camera'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { CompoundPath, compoundPathOuterBox } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { RGBA } from '@/utils'

import { buildOuterRoundedBoxPath } from './buildOuterRoundedBoxPath'
import { buildPath2DImageView } from './buildPath2DImageView'
import { drawBoxPath, drawBoxPathV2 } from './drawBoxPath'
import { drawVertex, drawVertexV2 } from './drawVertex'
import { fillStyle } from './fillStyle'
import { lineWidth } from './lineWidth'
import { strokeStyle } from './strokeStyle'

export const drawPathV2 = (
  drawFn: DrawCallback,
  compoundPath: CompoundPath,
  camera: Camera,
  color: RGBA,
  inferred: boolean,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false,
  path2D: Path2D | undefined = undefined
): void => {
  drawFn(ctx => {
    ctx.strokeStyle = strokeStyle(color, filter, inferred, isSelected)
    ctx.fillStyle = fillStyle(color, filter, inferred, isHighlighted, isSelected)

    let path
    if (path2D) {
      path = path2D
    } else {
      path = buildPath2DImageView(compoundPath.path)
      for (const p of compoundPath.additionalPaths) {
        const additionalPath = buildPath2DImageView(p)
        path.addPath(additionalPath)
      }
    }

    // the line width will change at different zoom levels.
    ctx.lineWidth = lineWidth(camera, inferred) * 1.0 / camera.scale
    ctx.stroke(path)
    ctx.fill(path, 'evenodd')

    if (inferred) {
      const compoundBoxPath = compoundPathOuterBox(compoundPath)
      const boxPath = buildOuterRoundedBoxPath(compoundBoxPath, camera)
      drawBoxPathV2(drawFn, camera, boxPath, inferred)
    }
  })

  if (!isSelected) { return }

  for (const point of compoundPath.path) {
    drawVertexV2(drawFn, camera, point, filter, color, isSelected, false)
  }

  for (const path of compoundPath.additionalPaths) {
    for (const point of path) {
      drawVertexV2(drawFn, camera, point, filter, color, isSelected, false)
    }
  }
}

/**
 * @deprecated
 * @param compoundPath
 * @param context
 * @param camera
 * @param color
 * @param {boolean} inferred - will draw additional box vertices
 * @param filter
 * @param isHighlighted
 * @param isSelected
 * @param path2D
 * @returns
 */
export const drawPath = (
  compoundPath: CompoundPath,
  ctx: CanvasRenderingContext2D,
  camera: Camera,
  color: RGBA,
  inferred: boolean,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false,
  path2D: Path2D | undefined = undefined
): Path2D | undefined => {
  ctx.strokeStyle = strokeStyle(color, filter, inferred, isSelected)
  ctx.fillStyle = fillStyle(color, filter, inferred, isHighlighted, isSelected)

  let path
  if (path2D) {
    path = path2D
  } else {
    path = buildPath2DImageView(compoundPath.path)
    for (const p of compoundPath.additionalPaths) {
      const additionalPath = buildPath2DImageView(p)
      path.addPath(additionalPath)
    }
  }

  // path2d is in imagePoint, we need to convert it to canvas coordinates
  ctx.save()
  camera.imageViewCtxToCanvasViewCtx(ctx)
  // the line width will change at different zoom levels.
  ctx.lineWidth = lineWidth(camera, inferred) * 1.0 / camera.scale
  ctx.stroke(path)
  ctx.fill(path, 'evenodd')
  ctx.restore()

  if (inferred) {
    const compoundBoxPath = compoundPathOuterBox(compoundPath)
    const boxPath = buildOuterRoundedBoxPath(compoundBoxPath, camera)
    drawBoxPath(ctx, camera, boxPath, inferred)
  }

  if (!isSelected) { return path }

  for (const point of compoundPath.path) {
    drawVertex(ctx, camera, point, filter, color, isSelected)
  }

  for (const path of compoundPath.additionalPaths) {
    for (const point of path) {
      drawVertex(ctx, camera, point, filter, color, isSelected)
    }
  }

  return path
}
