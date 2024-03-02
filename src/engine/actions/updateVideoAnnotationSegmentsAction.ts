import { Action } from '@/engine/managers/actionManager'
import { View, Annotation, VideoAnnotationData } from '@/engine/models'

function removeKeyframesOutsideOfVideoRange (
  frames: VideoAnnotationData['frames'],
  view: View
): void  {
  const numFrames = Object.keys(frames).length
  const lastFrameIndex = view.totalItemsFrames - 1

  if (numFrames === 1) {
    // Check if our only keyframe is now out of video range.
    const frame = Object.keys(frames)[0]
    const frameIndex = parseInt(frame, 10)

    if (frameIndex < 0) {
      // Only keyframe now translated outside video, clip to first frame.
      frames[0] = frames[frameIndex]
      delete frames[frameIndex]
    } else if (frameIndex > lastFrameIndex) {
      // Only keyframe now translated outside video, clip to last frame.
      frames[lastFrameIndex] = frames[frameIndex]
      delete frames[lastFrameIndex]
    }
  } else {
    // Get list of frames moved outside bottom of the video range
    const framesMovedBelowZero: number[] = []
    const framesMovedPastLastFrame: number[] = []

    Object.keys(frames).forEach((frame: string) => {
      const frameIndex = parseInt(frame, 10)

      // Remove keyframe if pushed outside video range.
      if (frameIndex < 0) {
        framesMovedBelowZero.push(frameIndex)
      } else if (frameIndex > lastFrameIndex) {
        framesMovedPastLastFrame.push(frameIndex)
      }
    })

    // Only one of framesMovedBelowZero or framesMovedPastLastFrame can be populated.
    if (framesMovedBelowZero.length && framesMovedPastLastFrame.length) {
      throw new Error(
        'One translation of a segment cannot push keyframes both below 0 and above max'
      )
    }

    if (framesMovedBelowZero.length) {
      // Find the frame closest to zero.
      const highestFrameIndex = Math.max(...framesMovedBelowZero)
      const keyFrame = frames[highestFrameIndex]

      // Remove keyframes pushed off the range.
      framesMovedBelowZero.forEach((frameIndex: number) => {
        delete frames[frameIndex]
      })

      if (frames[0] === undefined) {
        // There isn't a frame currently on frame 0.
        // Set the frame closest to zero to first frame.
        // TODO -> We should actually generate a new interpolated frame.
        frames[0] = keyFrame
      }
    } else if (framesMovedPastLastFrame.length) {
      // Find the frame closest to the video end.
      const lowestFrameIndex = Math.min(...framesMovedPastLastFrame)
      const keyFrame = frames[lowestFrameIndex]

      // Remove other keyframes pushed off the range.
      framesMovedPastLastFrame.forEach((frameIndex: number) => {
        delete frames[frameIndex]
      })

      if (frames[lastFrameIndex] === undefined) {
        // There isn't a frame currently on frame 0.
        // Set the frame closest to zero to first frame.
        // TODO -> We should actually generate a new interpolated
        // frame instead of clipping a keyframe.
        frames[lastFrameIndex] = keyFrame
      }
    }

    // Remove any frames which are off the edge of the video.
    Object.keys(frames).forEach((frame: string) => {
      const frameIndex = parseInt(frame, 10)

      // Remove keyframe if pushed outside video range.
      if (frameIndex < 0 || frameIndex > lastFrameIndex) {
        delete frames[frameIndex]
      }
    })
  }
}

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
    Math.min(Math.round(floatY), view.totalItemsFrames)
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

    removeKeyframesOutsideOfVideoRange(frames, view)
  }

  return {
    async do (): Promise<boolean> {
      annotation.data = { ...annotation.data, frames, segments }
      await view
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    },
    async undo (): Promise<boolean> {
      annotation.data = previousData
      await view
        .annotationManager
        .persistUpdateAnnotation(annotation)
      return true
    }
  }
}
