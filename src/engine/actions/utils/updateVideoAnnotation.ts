import { Editor } from '@/engine/editor'
import { VideoAnnotation } from '@/engine/models'
import { isSkeleton } from '@/engine/plugins/skeleton'
import { SkeletonNode } from '@/engine/plugins/skeleton/types'
import { Annotation } from '@/store/types'

export const updateVideoAnnotation = (
  editor: Editor,
  annotation: VideoAnnotation,
  updateFn: (...args: any[]) => SkeletonNode[],
  ...args: any[]
): Annotation => {
  if (!editor.loadedVideo) { throw new Error('Expected video to be loaded') }

  const frameIndex = editor.activeView.currentFrameIndex
  const { data } = annotation.inferVideoData(editor.activeView)
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
