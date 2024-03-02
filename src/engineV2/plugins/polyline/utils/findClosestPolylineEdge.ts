import { euclideanDistance } from '@/engineCommon/algebra'
import { anchorCursor, CanvasPoint, EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models/annotation'
import { Polyline, POLYLINE_ANNOTATION_TYPE } from '@/engineV2/plugins/polyline/types'

/**
 * Loops through all visible polylines, finding the closest edge for the currentPoint
 * @returns [closest point on the edge, the polyline, the distance] or null
*/
export function findClosestPolylineEdge (
  editor: Editor,
  currentPoint: CanvasPoint,
  maxDistance: number
): [ImagePoint, Annotation, number, EditableImagePoint[]] | null {
  const annotationCursor = editor.activeView.camera.canvasViewToImageView(currentPoint)
  let distanceToEdge: Array<[number, ImagePoint, Annotation, number, EditableImagePoint[]]> = []

  for (const annotation of editor.activeView.annotationManager.visibleAnnotations) {
    // we should filter automatically somehow
    if (annotation.type !== POLYLINE_ANNOTATION_TYPE) {
      continue
    }
    let polyline: Polyline
    if (annotation.isVideoAnnotation()) {
      const { data: videoData } = annotation.inferVideoData(editor.activeView)
      polyline = videoData as Polyline
    } else {
      polyline = annotation.data as Polyline
    }
    for (let i = 0; i < (polyline.path || []).length - 1; i++) {
      const point = polyline.path[i]
      const nextPoint = polyline.path[i + 1]
      const pointOnLine = anchorCursor(annotationCursor, point, nextPoint)
      const distanceFromCursor = euclideanDistance(
        editor.activeView.camera.imageViewToCanvasView(annotationCursor),
        editor.activeView.camera.imageViewToCanvasView(pointOnLine)
      )

      if (distanceFromCursor > maxDistance) { continue }

      // calculate if the point is between point and nextPoint.
      const AB = euclideanDistance(point, nextPoint)
      const AC = euclideanDistance(point, pointOnLine)
      const BC = euclideanDistance(nextPoint, pointOnLine)
      if (AB < AC + BC - 0.001) { continue }

      distanceToEdge.push([distanceFromCursor, pointOnLine, annotation, i + 1, polyline.path])
    }
  }
  distanceToEdge = distanceToEdge.sort(([d1], [d2]) => d1 - d2)
  if (distanceToEdge.length > 0) {
    return [distanceToEdge[0][1], distanceToEdge[0][2], distanceToEdge[0][3], distanceToEdge[0][4]]
  }
  return null
}
