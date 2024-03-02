import { EditableImagePoint } from '@/engineCommon/point'

// Build a path2d object, stay in the image coordinate space
export const buildPath2DImageView = (
  path: EditableImagePoint[],
  closePath: boolean = true
): Path2D => {
  const canvasPath = new Path2D()
  canvasPath.moveTo(path[0].x, path[0].y)
  for (let i = 1; i < path.length; i++) {
    canvasPath.lineTo(path[i].x, path[i].y)
  }
  if (closePath) { canvasPath.closePath() }
  return canvasPath
}
