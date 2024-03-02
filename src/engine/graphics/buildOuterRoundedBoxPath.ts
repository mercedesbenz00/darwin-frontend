import { Camera } from '@/engineCommon/camera'

export const buildOuterRoundedBoxPath = (
  outerBox: {
    xmin: number,
    xmax: number,
    ymin: number,
    ymax: number
  },
  camera: Camera,
  canvasCornerSize: number = 6
): Path2D => {
  const { xmin, xmax, ymin, ymax } = outerBox
  const cornerSize = canvasCornerSize / camera.scale
  const radius = cornerSize / 3
  const boxPath = new Path2D()

  const topLeftCornerPath = new Path2D()
  topLeftCornerPath.moveTo(xmin, ymin + cornerSize)
  topLeftCornerPath.lineTo(xmin, ymin + radius)
  topLeftCornerPath.arcTo(xmin, ymin, xmin + radius, ymin, radius)
  topLeftCornerPath.lineTo(xmin + cornerSize, ymin)

  const topRightCornerPath = new Path2D()
  topRightCornerPath.moveTo(xmax - cornerSize, ymin)
  topRightCornerPath.lineTo(xmax - radius, ymin)
  topRightCornerPath.arcTo(xmax, ymin, xmax, ymin + radius, radius)
  topRightCornerPath.lineTo(xmax, ymin + cornerSize)

  const bottomRightCornerPath = new Path2D()
  bottomRightCornerPath.moveTo(xmax, ymax - cornerSize)
  bottomRightCornerPath.lineTo(xmax, ymax - radius)
  bottomRightCornerPath.arcTo(xmax, ymax, xmax - radius, ymax, radius)
  bottomRightCornerPath.lineTo(xmax - cornerSize, ymax)

  const bottomLeftCornerPath = new Path2D()
  bottomLeftCornerPath.moveTo(xmin + cornerSize, ymax)
  bottomLeftCornerPath.lineTo(xmin + radius, ymax)
  bottomLeftCornerPath.arcTo(xmin, ymax, xmin, ymax - radius, radius)
  bottomLeftCornerPath.lineTo(xmin, ymax - cornerSize)

  boxPath.addPath(topLeftCornerPath)
  boxPath.addPath(topRightCornerPath)
  boxPath.addPath(bottomRightCornerPath)
  boxPath.addPath(bottomLeftCornerPath)

  return boxPath
}
