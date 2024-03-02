import { View, CompoundPath, compoundPathOuterBox } from '@/engine/models'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { RGBA } from '@/utils'

import { buildOuterRoundedBoxPath } from './buildOuterRoundedBoxPath'
import { buildPath2DImageView } from './buildPath2DImageView'
import { drawBoxPath } from './drawBoxPath'
import { drawVertex } from './drawVertex'
import { fillStyle } from './fillStyle'
import { lineWidth } from './lineWidth'
import { strokeStyle } from './strokeStyle'

/**
 *
 * @param canvas
 * @param camera
 * @param compoundPath
 * @param color
 * @param {boolean} inferred - will draw additional box vertices
 * @param filter
 * @param isHighlighted
 * @param isSelected
 * @param path2D
 * @returns
 */
export const drawPath = (
  view: View,
  compoundPath: CompoundPath,
  color: RGBA,
  inferred: boolean,
  filter: ImageManipulationFilter | null,
  isHighlighted = false,
  isSelected = false,
  path2D: Path2D | undefined = undefined
): Path2D | undefined => {
  const ctx = view.annotationsLayer.context
  if (!ctx) { return }

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
  view.camera.imageViewCtxToCanvasViewCtx(ctx)
  // the line width will change at different zoom levels.
  ctx.lineWidth = lineWidth(view.camera, inferred) * 1.0 / view.camera.scale
  ctx.stroke(path)
  ctx.fill(path, 'evenodd')
  ctx.restore()

  if (inferred) {
    const compoundBoxPath = compoundPathOuterBox(compoundPath)
    const boxPath = buildOuterRoundedBoxPath(compoundBoxPath, view.camera)
    drawBoxPath(ctx, view.camera, boxPath, inferred)
  }

  if (!isSelected) { return path }

  for (const point of compoundPath.path) {
    drawVertex(ctx, view.camera, point, filter, color, isSelected)
  }
  for (const path of compoundPath.additionalPaths) {
    for (const point of path) {
      drawVertex(ctx, view.camera, point, filter, color, isSelected)
    }
  }
  return path
}
