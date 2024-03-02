import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint, IPoint } from '@/engineCommon/point'
import { drawPoint, drawPointV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  Annotation,
  MainAnnotationTypeRenderer,
  ILayer,
  CompoundPath,
  AnnotationData
} from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import { Keypoint } from './types'

export class KeypointRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true
  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    _: boolean,
    filter: ImageManipulationFilter | null): void {
    const color = annotation.color
    const point = new EditablePoint<'Image'>(annotation.data as IPoint)
    if (FeatureFlagsManager.isOnLayerV2) {
      drawPointV2(
        drawFn,
        view.camera,
        point,
        color,
        filter,
        annotation.isHighlighted,
        annotation.isSelected
      )
    } else {
      drawPoint(
        view.camera,
        layer.context,
        point,
        color,
        filter,
        annotation.isHighlighted,
        annotation.isSelected
      )
    }
  }

  getPath (annotation: Annotation): CompoundPath {
    const point = new EditablePoint<'Image'>(annotation.data as IPoint)
    return { path: [point], additionalPaths: [] }
  }

  moveVertex (annotation: Annotation, vertex: EditableImagePoint, offset: ImagePoint): void {
    annotation.data = vertex.add(offset) as Keypoint
    vertex.add_(offset)
  }

  getAllVertices (annotation: Annotation): [EditablePoint<'Image'>] {
    let data: AnnotationData = annotation.data

    if (annotation.isVideoAnnotation()) {
      const res = annotation.inferVideoData(annotation.view)
      data = res.data
    } else {
      data = annotation.data
    }

    // Data might contain empty object
    const point = new EditablePoint<'Image'>(data as IPoint)
    return [point]
  }

  translate (annotation: Annotation, offset: ImagePoint): void {
    const point = new EditablePoint<'Image'>(annotation.data as IPoint)
    annotation.data = point.add(offset) as Keypoint
  }

  interpolate (
    prevData: Keypoint,
    nextData: Keypoint,
    params: LinearInterpolationParams
  ): Keypoint {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      return {
        x: prevData.x + (nextData.x - prevData.x) * interpolationFactor,
        y: prevData.y + (nextData.y - prevData.y) * interpolationFactor
      }
    }

    throw new Error(`Interpolate: keypoints don't support '${algorithm}' interpolation algorithm`)
  }
}
