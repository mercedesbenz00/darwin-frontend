import { AnnotationData, VideoAnnotation } from '@/store/types'

export const findClosestKeyFrame = (
  annotation: VideoAnnotation,
  currentFrameIndex: number,
  dataKey: keyof AnnotationData
): AnnotationData | undefined => {
  const closestLeftEntry = Object
    .entries(annotation.data.frames)
    .filter(([frame]) => parseInt(frame) <= currentFrameIndex)
    .reverse()
    .find(([, data]) => !!data[dataKey])

  if (closestLeftEntry) {
    return closestLeftEntry[1]
  }

  const closestRightEntry = Object
    .entries(annotation.data.frames)
    .filter(([frame]) => parseInt(frame) > currentFrameIndex)
    .find(([, data]) => !!data[dataKey])

  if (closestRightEntry) {
    return closestRightEntry[1]
  }
}
