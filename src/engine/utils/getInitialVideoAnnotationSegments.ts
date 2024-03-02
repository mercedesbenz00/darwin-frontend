import { Editor } from '@/engine/editor'
import { VideoAnnotationData } from '@/store/types'

/**
 * Computes the segments value for a newly created video annotation.
 *
 * On single view videos, this usually just [currentFrame, length]. However,
 * there are different edge cases that need to be accounted for.
 *
 * - annotation length might put the annotation to past the length of the video,
 *   so we need to respect the upper bound
 * - with split views, each view past the 0th has a built in offset, so that
 *   offset needs to be accounted for.
 */
export const getInitialVideoAnnotationSegments = (
  editor: Editor
): NonNullable<VideoAnnotationData['segments']> => {
  const { videoAnnotationDuration } = editor.store.state.workview
  const { currentFrameIndex, firstFrameIndex, totalFrames } = editor.activeView

  const startFrame: number = currentFrameIndex

  const endFrame: number = Math.min(
    firstFrameIndex + totalFrames,
    startFrame + videoAnnotationDuration
  )

  return [[startFrame, endFrame]]
}
