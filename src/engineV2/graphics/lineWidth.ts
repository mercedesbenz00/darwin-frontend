import { Camera } from '@/engineCommon/camera'

export const lineWidth = (camera: Camera, inferred: boolean = false): number => {
  const factor = inferred ? 2 : 1
  return camera.lineWidth * factor
}
