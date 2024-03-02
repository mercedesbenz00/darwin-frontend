import { Action } from '@/engineV2/managers/actionManager'
import { Annotation } from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Defines an undoable action for updating segments of a video annotation
 *
 * Since the segment value comes from dragging, compounted by current scaling,
 * the range will often end up as a non-integer.
 *
 * The backend will fail unless it's integer, so we round it down as a last
 * resort as part of this acount.
 */
export const updateVideoAnnotationSegmentsAction = (
  view: View,
  annotation: Annotation,
  [floatX, floatY]: [number, number]
): Action => {
  const range = [
    Math.max(Math.round(floatX), view.firstFrameIndex),
    Math.min(Math.round(floatY), view.totalFrames)
  ]
  const previousData = annotation.data
  const {
    0: fromStartSegmentFrame,
    length: l,
    [l - 1]: fromEndSegmentFrame
  } = annotation.data.segments.flat()
  const [toStartSegmentFrame, toEndSegmentFrame] = range
  let frames = { ...annotation.data.frames }
  let segments = [range]
  if (fromEndSegmentFrame - fromStartSegmentFrame === toEndSegmentFrame - toStartSegmentFrame) {
    const delta = toStartSegmentFrame - fromStartSegmentFrame
    if (delta) {
      frames = {}
      Object.keys(annotation.data.frames).forEach(frame => {
        frames[parseInt(frame, 10) + delta] = annotation.data.frames[frame]
      })
      if (annotation.data.segments.length > 1) {
        segments = annotation.data.segments.map((segment: number[]) => {
          return segment.map((val: number) => val + delta)
        })
      }
    } else {
      segments = annotation.data.segments
    }
  }
  return {
    do () {
      annotation.data = { ...annotation.data, frames, segments }
      view.annotationManager.updateAnnotation(annotation)
      return true
    },
    undo () {
      annotation.data = previousData
      view.annotationManager.updateAnnotation(annotation)
      return true
    }
  }
}
