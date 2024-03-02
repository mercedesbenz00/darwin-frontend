import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'
import { drawPath, drawPathV2, drawText, drawTextV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, MainAnnotationTypeRenderer, CompoundPath, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import { BoundingBox } from './types'

export const getPath = (annotation: Annotation, view: View): EditableImagePoint[] => {
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
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
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
    if (FeatureFlagsManager.isOnLayerV2) {
      drawPathV2(
        drawFn,
        path,
        view.camera,
        color,
        inferred,
        filter,
        annotation.isHighlighted && !blackout,
        annotation.isSelected && !blackout
      )
    } else {
      annotation.path2D = drawPath(
        path,
        layer.context,
        view.camera,
        color,
        inferred,
        filter,
        annotation.isHighlighted && !blackout,
        annotation.isSelected && !blackout
      )
    }

    if (!annotation.isHighlighted) { return }

    if (annotation.text) {
      const boxPath = path.path
      if (boxPath.length !== 4) { return }
      if (FeatureFlagsManager.isOnLayerV2) {
        drawTextV2(
          drawFn,
          boxPath[0],
          boxPath[1].x - boxPath[0].x,
          boxPath[3].y - boxPath[0].y,
          annotation.text,
          { r: 255, g: 255, b: 255, a: 1.0 },
          { r: 0, g: 0, b: 0, a: 0.8 },
          'FiraMono'
        )
      } else {
        drawText(
          view.camera,
          layer.context,
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
  }

  getPath (
    annotation: Annotation,
    view: View
  ): CompoundPath {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (
    annotation: Annotation,
    view: View
  ): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (
    annotation: Annotation,
    offset: ImagePoint,
    view: View
  ): void {
    getPath(annotation, view).map(point => point.add_(offset))
  }

  moveVertex (
    annotation: Annotation,
    movingVertex: EditableImagePoint,
    offset: ImagePoint,
    view: View
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
