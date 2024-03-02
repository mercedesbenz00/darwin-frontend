import { drawOpenPath } from '@/engine/graphics'
import { LinearInterpolationParams } from '@/engine/interpolate'
import { Annotation, View, MainAnnotationTypeRenderer, CompoundPath } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'

import { Polyline } from './types'
import { interpolatePolylineFixedAlign, interpolateResizePolyline } from './utils/interpolation'

function getPath (annotation: Annotation, view: IView): EditableImagePoint[] {
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
    view: View,
    annotation: Annotation,
    _: boolean, filter: ImageManipulationFilter | null
  ): void {
    const path = getPath(annotation, view)
    const color = annotation.color

    annotation.path2D = drawOpenPath(
      view,
      path,
      color,
      filter,
      annotation.isSelected,
      annotation.path2D
    )
  }

  getPath (annotation: Annotation, view: IView): CompoundPath {
    return { path: getPath(annotation, view), additionalPaths: [] }
  }

  getAllVertices (annotation: Annotation, view: IView): EditableImagePoint[] {
    return getPath(annotation, view)
  }

  translate (annotation: Annotation, offset: ImagePoint, view: IView): void {
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
