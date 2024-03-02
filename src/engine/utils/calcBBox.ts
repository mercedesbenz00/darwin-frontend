import { View, Annotation } from '@/engine/models'
import { EditableImagePoint } from '@/engineCommon/point'

export type BBox = {
  width: number
  height: number
  x: number
  y: number
}

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
