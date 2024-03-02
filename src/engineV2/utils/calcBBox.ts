import { euclideanDistance } from '@/engineCommon/algebra'
import { EditableImagePoint } from '@/engineCommon/point'
import { Annotation } from '@/engineV2/models/annotation'
import { Ellipse } from '@/engineV2/plugins/ellipse/types'
import { Keypoint } from '@/engineV2/plugins/keypoint/types'
import { View } from '@/engineV2/views'

export type BBox = {
  width: number
  height: number
  x: number
  y: number
}

const PADDING = 4

/**
 * Returns BBox for annotation.
 * getBBox calculates bbox wrong sometimes (eclipse for e.g.).
 */
export const getOriginBBox = (view: View, annotation: Annotation): BBox | undefined => {
  if (annotation.type === 'keypoint') {
    let keypoint: Keypoint = annotation.data as Keypoint
    if (annotation.isVideoAnnotation()) {
      keypoint = annotation.inferVideoData(view).data as Keypoint
    }

    return {
      x: keypoint.x,
      y: keypoint.y,
      width: 5.5 + (PADDING * view.camera.scale),
      height: 5.5 + (PADDING * view.camera.scale)
    }
  }

  if (annotation.type === 'ellipse') {
    let ellipse: Ellipse = annotation.data as Ellipse
    if (annotation.isVideoAnnotation()) {
      ellipse = annotation.inferVideoData(view).data as Ellipse
    }

    const radius = {
      x: euclideanDistance(ellipse.center, ellipse.right),
      y: euclideanDistance(ellipse.center, ellipse.top)
    }
    const angle = Math.atan2(ellipse.right.y - ellipse.center.y, ellipse.right.x - ellipse.center.x)

    const xAx = Math.cos(angle)
    const xAy = Math.sin(angle)
    const w = ((radius.x * xAx) ** 2 + (radius.y * xAy) ** 2) ** 0.5
    const h = ((radius.x * xAy) ** 2 + (radius.y * xAx) ** 2) ** 0.5

    return {
      x: ellipse.center.x,
      y: ellipse.center.y,
      width: w * 2 + (PADDING * view.camera.scale),
      height: h * 2 + (PADDING * view.camera.scale)
    }
  }

  const renderer = view.renderManager.rendererFor(annotation.type)
  if (!renderer || !('getAllVertices' in renderer)) { return }

  const { path: mainPath, additionalPaths } = renderer.getPath(annotation, view)

  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

  const allPaths = [mainPath, ...additionalPaths]
  allPaths.forEach((path: EditableImagePoint[]) => {
    path.forEach((point: EditableImagePoint) => {
      xMin = Math.min(point.x, xMin)
      yMin = Math.min(point.y, yMin)
      xMax = Math.max(point.x, xMax)
      yMax = Math.max(point.y, yMax)
    })
  })

  const width = Math.abs(xMax - xMin)
  const height = Math.abs(yMax - yMin)

  return {
    width: width + (PADDING * view.camera.scale),
    height: height + (PADDING * view.camera.scale),
    x: (xMax + xMin) / 2 || Infinity,
    y: (yMax + yMin) / 2 || Infinity
  }
}

/**
 * Returns BBox for annotation.
 *
 * @deprecated
 * getBBox calculates bbox wrong sometimes (eclipse for e.g.).
 * @param view
 * @param annotation
 * @returns
 */
export const getBBox = (view: View, annotation: Annotation): BBox | undefined => {
  const renderer = view.renderManager.rendererFor(annotation.type)
  if (!renderer || !('getAllVertices' in renderer)) { return }

  const { path: mainPath, additionalPaths } = renderer.getPath(annotation, view)

  let xMin = Infinity
  let xMax = -Infinity
  let yMin = Infinity
  let yMax = -Infinity

  const allPaths = [mainPath, ...additionalPaths]
  allPaths.forEach((path: EditableImagePoint[]) => {
    path.forEach((point: EditableImagePoint) => {
      const p = view.camera.imageViewToCanvasView(point)

      xMin = Math.min(p.x, xMin)
      yMin = Math.min(p.y, yMin)
      xMax = Math.max(p.x, xMax)
      yMax = Math.max(p.y, yMax)
    })
  })

  const width = Math.abs(xMax - xMin)
  const height = Math.abs(yMax - yMin)

  return {
    width,
    height,
    x: (xMax + xMin) / 2 || Infinity,
    y: (yMax + yMin) / 2 || Infinity
  }
}
