import { drawPath } from '@/engine/graphics'
import { LinearInterpolationParams } from '@/engine/interpolate'
import { Annotation, View, MainAnnotationTypeRenderer } from '@/engine/models'
import { IView } from '@/engine/models/views/types'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'
import { EditableImagePoint, EditablePoint, ImagePoint } from '@/engineCommon/point'

import { Polygon } from './types'
import { interpolatePolygonFixedAlign, interpolateResizePolygon } from './utils'

function getPath (annotation: Annotation, view: IView): EditableImagePoint[] {
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    return (data && data.path) || []
  }
  const polygon = annotation.data as Polygon
  return polygon.path
}

function getAdditionalPaths (annotation: Annotation, view: IView): EditableImagePoint[][] {
  if (annotation.isVideoAnnotation()) {
    const { data } = annotation.inferVideoData(view)
    return (data && data.additionalPaths) || []
  }
  const polygon = annotation.data as Polygon
  return polygon.additionalPaths || []
}

export class PolygonRenderer extends MainAnnotationTypeRenderer {
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
      annotation.isSelected && !blackout,
      annotation.path2D
    )
  }

  getPath (annotation: Annotation, view: IView): {
    path: EditableImagePoint[],
    additionalPaths: EditableImagePoint[][]
  } {
    return {
      path: getPath(annotation, view),
      additionalPaths: getAdditionalPaths(annotation, view)
    }
  }

  getAllVertices (annotation: Annotation, view: View): EditableImagePoint[] {
    const compoundPath = this.getPath(annotation, view)
    let { path } = compoundPath

    for (const additionalPath of compoundPath.additionalPaths) {
      path = path.concat(additionalPath)
    }
    return path
  }

  translate (annotation: Annotation, offset: ImagePoint, view: IView): void {
    getPath(annotation, view).forEach(point => point.add_(offset))
    getAdditionalPaths(annotation, view)
      .forEach(path => path.map(point => point.add_(offset)))
  }

  moveVertex (annotation: Annotation, vertex: EditableImagePoint, offset: ImagePoint): void {
    vertex.add_(offset)
  }

  interpolate (prevData: Polygon, nextData: Polygon, params: LinearInterpolationParams): Polygon {
    const { algorithm, interpolationFactor } = params

    if (!algorithm || algorithm.startsWith('linear')) {
      const newPath = interpolatePolygonFixedAlign(
        interpolationFactor,
        prevData.path,
        nextData.path,
        interpolateResizePolygon,
        algorithm
      )
      return {
        path: newPath.map(p => new EditablePoint<'Image'>(p)),
        additionalPaths: prevData.additionalPaths?.map((path, index) => {
          if (prevData.additionalPaths?.[index] && nextData.additionalPaths?.[index]) {
            return interpolatePolygonFixedAlign(
              interpolationFactor,
              prevData.additionalPaths[index],
              nextData.additionalPaths[index],
              interpolateResizePolygon,
              algorithm
            ).map(p => new EditablePoint<'Image'>(p))
          }

          return path
        })
      }
    }

    throw new Error(`Interpolate: polygons don't support '${algorithm}' interpolation algorithm`)
  }
}
