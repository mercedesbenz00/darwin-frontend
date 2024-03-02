import { euclideanDistance } from '@/engineCommon/algebra'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint, Point } from '@/engineCommon/point'
import { drawEllipse, drawEllipseV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, MainAnnotationTypeRenderer, SpecialKey } from '@/engineV2/models'
import { DrawCallback, ILayer } from '@/engineV2/models/layers/types'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import { Ellipse } from './types'

// getPath doesn't make much sense for Ellipses, since we don't convert the
// ellipse to a compound path here in the frontend.
// However, since we need to support interpolation and
// other MainAnnotationTypeRenderer features, we still implement
// a dummy getPath. We should instead reconsider some aspects of the
// MainAnnotationTypeRenderer implementation.
function getPath (annotation: Annotation, view: View): EditableImagePoint[] {
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    return data && data.center && data.top && data.right && data.bottom && data.left
      ? [data.center, data.top, data.right, data.bottom, data.left]
      : []
  }
  const { center, top, right, bottom, left } = annotation.data as Ellipse
  return [center, top, right, bottom, left]
}

export class EllipseRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const ellipse = annotation.data as Ellipse
    const color = annotation.color

    if (FeatureFlagsManager.isOnLayerV2) {
      drawEllipseV2(
        drawFn,
        view.camera,
        ellipse,
        color,
        filter,
        annotation.isHighlighted,
        annotation.isSelected
      )
    } else {
      annotation.path2D = drawEllipse(
        view.camera,
        layer.context,
        ellipse,
        color,
        filter,
        annotation.isHighlighted,
        annotation.isSelected
      )
    }
  }

  /**
   *
   * @param annotation
   * @param point
   * @returns
   */
  containsPoint (
    annotation: Annotation,
    point: ImagePoint
  ): boolean {
    let ellipse: Ellipse = annotation.data as Ellipse
    if (annotation.isVideoAnnotation()) {
      ellipse = annotation.inferVideoData(annotation.view).data as Ellipse
    }

    const radius = {
      x: euclideanDistance(ellipse.center, ellipse.right),
      y: euclideanDistance(ellipse.center, ellipse.top)
    }
    const angle = Math.atan2(ellipse.right.y - ellipse.center.y, ellipse.right.x - ellipse.center.x)

    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const dx = point.x - ellipse.center.x
    const dy = point.y - ellipse.center.y
    const tdx = cos * dx + sin * dy
    const tdy = sin * dx - cos * dy

    return (tdx * tdx) / (radius.x ** 2) + (tdy * tdy) / (radius.y ** 2) <= 1
  }

  getPath (annotation: Annotation, view: View) {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation, view: View): EditableImagePoint[] {
    const path = getPath(annotation, view)
    if (path.length === 5) {
      return path.slice(1)
    }
    return []
  }

  translate (annotation: Annotation, offset: ImagePoint, view: View) {
    getPath(annotation, view).map(point => point.add_(offset))
  }

  moveVertex (
    annotation: Annotation,
    movingVertex: EditableImagePoint,
    offset: ImagePoint,
    view: View,
    specialKey?: SpecialKey
  ) {
    const { center, top, right, left, bottom } = annotation.data as Ellipse

    // First, determine the role of all actionable points.
    // movingVertex is the vertex which is currently held and moved by the user
    // oppositeVertex is the vertex at the other side with respect to the center point
    // symVertex is the vertex which is sitting on the other ellipse diameter
    // oppositeSymVertex is the vertex at the other side of symVertex
    // with respect to the center point
    let oppositeVertex: EditableImagePoint | undefined
    let symVertex: EditableImagePoint | undefined
    let oppositeSymVertex: EditableImagePoint | undefined
    let isTopOrBottomMoving = false

    if (right.x === movingVertex.x && right.y === movingVertex.y) {
      oppositeVertex = left
      symVertex = top
      oppositeSymVertex = bottom
    } else if (top.x === movingVertex.x && top.y === movingVertex.y) {
      oppositeVertex = bottom
      symVertex = right
      oppositeSymVertex = left
      isTopOrBottomMoving = true
    } else if (left.x === movingVertex.x && left.y === movingVertex.y) {
      oppositeVertex = right
      symVertex = bottom
      oppositeSymVertex = top
    } else if (bottom.x === movingVertex.x && bottom.y === movingVertex.y) {
      oppositeVertex = top
      symVertex = left
      oppositeSymVertex = right
      isTopOrBottomMoving = true
    }

    // If the moving vertex does not coincide with any of the ellipse action points, simply return
    if (!oppositeVertex || !symVertex || !oppositeSymVertex) { return }

    const oldD = euclideanDistance(movingVertex, center)
    const newD = euclideanDistance(movingVertex.add(offset), center)

    // If no special key is held, then project the offset vector on the moving diameter axis.
    // Move the other diameter control points and center point of the same offset,
    // halving its contribution.
    // The opposite vertex does not move.
    if (!specialKey) {
      movingVertex.add_(offset)
      center.add_(offset.div(2))
      symVertex.add_(offset.div(2))
      oppositeSymVertex.add_(offset.div(2))
    } else {
      // Move movingVertex and oppositeVertex according to offset,
      // and measure the difference in distance with respect to the center point
      movingVertex.add_(offset)
      oppositeVertex.sub_(offset)
    }

    // Compute the equivalent radius of the distance
    // with respect to the center point on the other ellipse diameter,
    // considering potential special keys changing the behaviour:
    // ALT makes the moving vertex offset count for the opposite vertex, too.
    // The center point acts as anchor.
    // SHIFT makes the distance on the moving diameter count for the other
    // diameter in the same absolute value
    // CTRL makes the distance on the moving diameter count for the other
    // diameter in the same relative value (i.e. proportionally)
    let d: number = 0
    switch (specialKey) {
    case 'ctrl':
      d = newD
      break
    case 'shift':
      d = euclideanDistance(center, symVertex) + newD - oldD
      break
    default:
      d = euclideanDistance(center, symVertex)
      break
    }
    const angle = isTopOrBottomMoving
      ? Math.atan2(center.y - movingVertex.y, center.x - movingVertex.x)
      : Math.atan2(movingVertex.y - center.y, movingVertex.x - center.x)
    // Move the vertices on the other diameter accordingly
    const oldSymX = symVertex.x
    const oldSymY = symVertex.y
    symVertex.x = center.x + d * Math.cos(angle - Math.PI / 2)
    symVertex.y = center.y + d * Math.sin(angle - Math.PI / 2)
    const symOffset = new Point<'Image'>({ x: symVertex.x - oldSymX, y: symVertex.y - oldSymY })
    oppositeSymVertex.sub_(symOffset)
  }

  interpolate (prevData: Ellipse, nextData: Ellipse, params: LinearInterpolationParams): Ellipse {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      const {
        center: prevCenter,
        right: prevRight,
        top: prevTop,
        left: prevLeft,
        bottom: prevBottom
      } = prevData
      const {
        center: nextCenter,
        right: nextRight,
        top: nextTop,
        left: nextLeft,
        bottom: nextBottom
      } = nextData

      // In case of ellipse rotation
      // the interpolation wouldn't rotate ellipse,
      // it would instead shrink it while the old 1 goes
      // to the new 1s position.
      // eslint-disable-next-line
      // more details: https://www.notion.so/v7labs/Ellipse-interpolation-algorithm-e359f1991e514592abd2fa54d25433e6
      const prev = [prevRight, prevTop, prevLeft, prevBottom]
      const next = [nextRight, nextTop, nextLeft, nextBottom]
      let minCost = 1e100
      let minCostIdx = 0
      for (let i = 0; i < 4; i++) {
        let cost = 0
        for (let j = 0; j < 4; j++) {
          const dist = prev[j].sub(next[(j + i) % 4])
          cost += dist.x ** 2 + dist.y ** 2
        }
        if (cost < minCost) {
          minCost = cost
          minCostIdx = i
        }
      }

      const interpolatedPoints = {
        center: new EditablePoint<'Image'>(
          prevCenter.add(nextCenter.sub(prevCenter).mul(interpolationFactor))
        ),
        right: new EditablePoint<'Image'>(
          prev[0].add(next[(minCostIdx + 0) % 4].sub(prev[0]).mul(interpolationFactor))
        ),
        top: new EditablePoint<'Image'>(
          prev[1].add(next[(minCostIdx + 1) % 4].sub(prev[1]).mul(interpolationFactor))
        ),
        left: new EditablePoint<'Image'>(
          prev[2].add(next[(minCostIdx + 2) % 4].sub(prev[2]).mul(interpolationFactor))
        ),
        bottom: new EditablePoint<'Image'>(
          prev[3].add(next[(minCostIdx + 3) % 4].sub(prev[3]).mul(interpolationFactor))
        )
      }
      return interpolatedPoints
    }

    throw new Error(`Interpolate: ellipses don't support '${algorithm}' interpolation algorithm`)
  }
}
