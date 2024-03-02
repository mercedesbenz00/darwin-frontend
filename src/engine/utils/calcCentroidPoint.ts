import {
  calcCentroid,
  calcEllipseCentroid,
  calcMiddleSegmentMiddlePoint,
  calcOuterBoxCentroid
} from '@/engine/graphics'
import { View, Annotation } from '@/engine/models'
import { CanvasPoint, EditableImagePoint, ImagePoint } from '@/engineCommon/point'

export function calcCentroidPointFromPath (
  view: View,
  path: EditableImagePoint[],
  type: string
): ImagePoint {
  switch (type) {
  case 'ellipse': return calcEllipseCentroid(path)
  case 'link': return calcMiddleSegmentMiddlePoint(path)
  case 'line': return calcMiddleSegmentMiddlePoint(path)
  case 'skeleton': return calcOuterBoxCentroid(path)
  default: return calcCentroid(path, view.camera.scale)
  }
}

export function calcCentroidPoint (view: View, annotation: Annotation): CanvasPoint | undefined {
  const renderer = view.renderManager.rendererFor(annotation.type)
  if (!renderer || !('getAllVertices' in renderer)) { return }

  const { path } = renderer.getPath(annotation, view)
  let centroid
  switch (annotation.type) {
  case 'ellipse':
  case 'line':
  case 'link':
  case 'skeleton':
  case 'keypoint':
    centroid = calcCentroidPointFromPath(view, path, annotation.type)
    break
  default:
    if (!annotation.centroid) {
      centroid = annotation.centroid = calcCentroidPointFromPath(view, path, annotation.type)
    } else {
      centroid = annotation.centroid
    }
    break
  }
  return view.camera.imageViewToCanvasView(centroid)
}
