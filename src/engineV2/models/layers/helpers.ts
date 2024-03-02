import { Camera } from '@/engineCommon/camera'
import { BBox } from '@/engineV2/utils'

/**
 * Returns true for bbox in the camera's viewport
 */
export const isVisible = (camera: Camera, bbox: BBox | undefined): boolean => {
  if (!bbox) { return true }

  const { x, y, width, height } = bbox
  const halfWidth = width / 2
  const halfHeight = height / 2
  if (x === Infinity || y === Infinity) { return true }

  const rect1 = {
    x: x - halfWidth,
    y: y - halfHeight,
    w: width,
    h: height
  }
  const rect2 = {
    x: camera.offset.x / camera.scale,
    y: camera.offset.y / camera.scale,
    w: camera.width / camera.scale,
    h: camera.height / camera.scale
  }

  if (
    rect1.x < rect2.x + rect2.w &&
    rect1.x + rect1.w > rect2.x &&
    rect1.y < rect2.y + rect2.h &&
    rect1.h + rect1.y > rect2.y
  ) {
    return true
  }

  return false
}
