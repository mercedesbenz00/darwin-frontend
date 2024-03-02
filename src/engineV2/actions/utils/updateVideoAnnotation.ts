import { VideoAnnotation, Annotation } from '@/engineV2/models'
import { isSkeleton } from '@/engineV2/plugins/skeleton'
import { SkeletonNode } from '@/engineV2/plugins/skeleton/types'
import { View } from '@/engineV2/views'

export const updateVideoAnnotation = (
  view: View,
  annotation: VideoAnnotation,
  updateFn: (...args: any[]) => SkeletonNode[],
  ...args: any[]
): Annotation => {
  if (!view.isLoaded) { throw new Error('Expected video to be loaded') }

  const frameIndex = view.currentFrameIndex
  const { data } = annotation.inferVideoData(view)
  if (!isSkeleton(data)) {
    throw new Error('action: expected annotation of skeleton type')
  }
  const nodes = updateFn(data, ...args)

  return annotation.shallowClone({
    data: {
      ...annotation.data,
      frames: {
        ...annotation.data.frames,
        [frameIndex]: { ...data, nodes }
      }
    }
  })
}
