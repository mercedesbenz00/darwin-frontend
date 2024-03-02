import { drawPath, drawText } from '@/engine/graphics'
import { LinearInterpolationParams } from '@/engine/interpolate'
import {
  View,
  Annotation,
  MainAnnotationTypeRenderer
} from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'

import { BoundingBox } from './types'

export function getPath (annotation: Annotation, view: IView): EditableImagePoint[] {
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    return data && data.topLeft && data.topRight && data.bottomRight && data.bottomLeft
      ? [data.topLeft, data.topRight, data.bottomRight, data.bottomLeft]
      : []
  }
  const boundingBox = annotation.data as BoundingBox
  return [
    boundingBox.topLeft,
    boundingBox.topRight,
    boundingBox.bottomRight,
    boundingBox.bottomLeft
  ]
}

export class BoundingBoxRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true
  render (
    view: View,
    annotation: Annotation,
    inferred: boolean,
    filter: ImageManipulationFilter | null
  ): void {
    const path = this.getPath(annotation, view)
    const color = annotation.color
    const blackout = annotation.annotationClass?.metadata.blackout === true
    if (blackout && filter) {
      filter = { ...filter, opacity: 100 }
    }
    annotation.path2D = drawPath(
      view,
      path,
      color,
      inferred,
      filter,
      annotation.isHighlighted && !blackout,
      annotation.isSelected && !blackout
    )

    if (!annotation.isHighlighted) { return }

    if (annotation.text) {
      const boxPath = path.path
      if (boxPath.length !== 4) { return }
      drawText(
        view,
        boxPath[0],
        boxPath[1].x - boxPath[0].x,
        boxPath[3].y - boxPath[0].y,
        annotation.text,
        { r: 255, g: 255, b: 255, a: 1.0 },
        { r: 0, g: 0, b: 0, a: 0.8 },
        'FiraMono'
      )
    }
  }

  getPath (
    annotation: Annotation,
    view: IView
  ) {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (
    annotation: Annotation,
    view: IView
  ): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (
    annotation: Annotation,
    offset: ImagePoint,
    view: IView
  ): void {
    getPath(annotation, view).map(point => point.add_(offset))
  }

  moveVertex (
    annotation: Annotation,
    movingVertex: EditableImagePoint,
    offset: ImagePoint,
    view: IView
  ): void {
    const path = getPath(annotation, view)
    let index: number | undefined
    for (let i = 0; i < path.length; i++) {
      if (path[i].x === movingVertex.x && path[i].y === movingVertex.y) {
        index = i
        break
      }
    }
    switch (index) {
    // Top Left -> Top Right and Bottom Left move
    case 0: {
      path[0].add_(offset)
      path[1].y += offset.y
      path[3].x += offset.x
      break
    }
    // Top Right -> Top Left and Bottom Right move
    case 1: {
      path[1].add_(offset)
      path[0].y += offset.y
      path[2].x += offset.x
      break
    }
    // Bottom Right -> Top Right and Bottom Left move
    case 2: {
      path[2].add_(offset)
      path[1].x += offset.x
      path[3].y += offset.y
      break
    }
    // Bottom Left -> Top Left and Bottom Right move
    case 3: {
      path[3].add_(offset)
      path[0].x += offset.x
      path[2].y += offset.y
      break
    }
    }
  }

  interpolate (
    prevData: BoundingBox,
    nextData: BoundingBox,
    params: LinearInterpolationParams
  ): BoundingBox {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      return {
        topLeft: new EditablePoint<'Image'>(
          prevData.topLeft.add(
            nextData.topLeft.sub(prevData.topLeft).mul(interpolationFactor)
          )
        ),
        topRight: new EditablePoint<'Image'>(
          prevData.topRight.add(
            nextData.topRight.sub(prevData.topRight).mul(interpolationFactor)
          )
        ),
        bottomRight: new EditablePoint<'Image'>(
          prevData.bottomRight.add(
            nextData.bottomRight.sub(prevData.bottomRight).mul(interpolationFactor)
          )
        ),
        bottomLeft: new EditablePoint<'Image'>(
          prevData.bottomLeft.add(
            nextData.bottomLeft.sub(prevData.bottomLeft).mul(interpolationFactor)
          )
        )
      }
    }

    throw new Error(
      `Interpolate: bounding boxes don't support '${algorithm}' interpolation algorithm`
    )
  }
}
