import { euclideanDistance } from '@/engineCommon/algebra'
import { anchorCursor, CanvasPoint, EditableImagePoint, ImagePoint } from '@/engineCommon/point'
import { Editor } from '@/engineV2/editor'
import { Annotation } from '@/engineV2/models/annotation'
import { Polygon, POLYGON_ANNOTATION_TYPE } from '@/engineV2/plugins/polygon/types'

/**
 * Loops through all visible polygons, finding the closest edge for the currentPoint
 * @returns [closet point on the edge, the polygon, the distance] or null
*/
export function findClosestPolygonEdge (
  editor: Editor,
  currentPoint: CanvasPoint,
  maxDistance: number
): [ImagePoint, Annotation, number, EditableImagePoint[]] | null {
  const annotationCursor = editor.activeView.camera.canvasViewToImageView(currentPoint)
  let distanceToEdge: Array<[number, ImagePoint, Annotation, number, EditableImagePoint[]]> = []

  const polygonAnnotations =
    editor.activeView.annotationManager.visibleAnnotations
      .filter(({ type }) => type === POLYGON_ANNOTATION_TYPE)

  for (const annotation of polygonAnnotations) {
    let polygon: Polygon
    if (annotation.isVideoAnnotation()) {
      const { data: videoData } = annotation.inferVideoData(editor.activeView)
      polygon = videoData as Polygon
    } else {
      polygon = annotation.data as Polygon
    }

    // we need to consider all edges, both in path and in additional paths
    const paths = [polygon.path || [], ...(polygon.additionalPaths || [])]
    for (const path of paths) {
      for (let i = 0; i < path.length; i++) {
        const point = path[i]
        const nextPoint = (i === path.length - 1) ? path[0] : path[i + 1]
        const pointOnLine = anchorCursor(annotationCursor, point, nextPoint)
        const distanceFromCusor = euclideanDistance(
          editor.activeView.camera.imageViewToCanvasView(annotationCursor),
          editor.activeView.camera.imageViewToCanvasView(pointOnLine)
        )

        if (distanceFromCusor > maxDistance) { continue }

        // calculate if the point is between point and nextPoint.
        const AB = euclideanDistance(point, nextPoint)
        const AC = euclideanDistance(point, pointOnLine)
        const BC = euclideanDistance(nextPoint, pointOnLine)
        if (AB < AC + BC - 0.001) { continue }

        distanceToEdge.push([distanceFromCusor, pointOnLine, annotation, i + 1, path])
      }
    }
  }
  distanceToEdge = distanceToEdge.sort(([d1], [d2]) => d1 - d2)
  if (distanceToEdge.length > 0) {
    return [distanceToEdge[0][1], distanceToEdge[0][2], distanceToEdge[0][3], distanceToEdge[0][4]]
  }
  return null
}
