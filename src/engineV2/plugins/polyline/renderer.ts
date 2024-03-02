import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'
import { drawOpenPath, drawOpenPathV2 } from '@/engineV2/graphics'
import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import { Annotation, MainAnnotationTypeRenderer, CompoundPath, ILayer } from '@/engineV2/models'
import { DrawCallback } from '@/engineV2/models/layers'
import { LinearInterpolationParams } from '@/engineV2/utils/interpolate'
import { View } from '@/engineV2/views'

import { Polyline } from './types'
import { interpolatePolylineFixedAlign, interpolateResizePolyline } from './utils/interpolation'

function getPath (annotation: Annotation, view: View): EditableImagePoint[] {
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    return (data && data.path) || []
  }
  const polyline = annotation.data as Polyline
  return polyline.path
}

export class PolylineRenderer extends MainAnnotationTypeRenderer {
  readonly supportsInterpolate: boolean = true
  readonly enableInterpolateByDefault: boolean = true

  render (
    drawFn: DrawCallback,
    view: View,
    layer: ILayer,
    annotation: Annotation,
    _: boolean, filter: ImageManipulationFilter | null
  ): void {
    const path = getPath(annotation, view)
    const color = annotation.color

    if (FeatureFlagsManager.isOnLayerV2) {
      drawOpenPathV2(
        drawFn,
        view.camera,
        path,
        color,
        filter,
        annotation.isSelected,
        annotation.path2D
      )
    } else {
      annotation.path2D = drawOpenPath(
        view.camera,
        layer.context,
        path,
        color,
        filter,
        annotation.isSelected,
        annotation.path2D
      )
    }
  }

  getPath (annotation: Annotation, view: View): CompoundPath {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation, view: View): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (annotation: Annotation, offset: ImagePoint, view: View): void {
    getPath(annotation, view).map(point => point.add_(offset))
  }

  moveVertex (annotation: Annotation, vertex: EditableImagePoint, offset: ImagePoint): void {
    vertex.add_(offset)
  }

  interpolate (
    prevData: Polyline,
    nextData: Polyline,
    params: LinearInterpolationParams
  ): Polyline {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      const newPath = interpolatePolylineFixedAlign(
        interpolationFactor,
        prevData.path,
        nextData.path,
        interpolateResizePolyline,
        algorithm
      )
      return {
        path: newPath.map(p => new EditablePoint<'Image'>(p)),
        additionalPaths: []
      }
    }

    throw new Error(`Interpolate: polylines don't support '${algorithm}' interpolation algorithm`)
  }
}
