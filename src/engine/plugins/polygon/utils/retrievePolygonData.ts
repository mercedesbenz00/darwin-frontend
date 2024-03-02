import { Editor } from '@/engine/editor'
import {
  Annotation,
  isImageAnnotation,
  isVideoAnnotation,
  VideoAnnotation
} from '@/engine/models'
import { Polygon } from '@/engine/plugins/polygon/types'
import { findClosestKeyFrame } from '@/engine/utils'

/**
 * Resolves polygon data for a video annotation.
 *
 * Since an annotation could span multiple frames, the correct video data
 * depends on which frame the editor is currently on.
 *
 * This is the entry from the closest keyframe to the left of the current frame,
 * or the closest to the right, if there are no entries to the left at all.
 */
const retrieveVideoPolygonData = (
  editor: Editor,
  annotation: VideoAnnotation
): Polygon | undefined => {
  const currentFrameIndex = editor.activeView.currentFrameIndex
  if (currentFrameIndex === undefined || currentFrameIndex < 0) { return }

  const frame = findClosestKeyFrame(annotation, currentFrameIndex, 'path')
  if (frame) {
    const { path, additionalPaths } = frame as Polygon
    return { path, additionalPaths }
  }
}

/**
 * Retrieves the contents of the auto_annotate key, if any,
 * within an image or video annotation.
 */
export const retrievePolygonData = (
  annotation: Annotation,
  editor: Editor
): Polygon | undefined => {
  if (isVideoAnnotation(annotation)) {
    return retrieveVideoPolygonData(editor, annotation)
  }

  if (isImageAnnotation(annotation)) {
    const { path, additionalPaths } = annotation.data as Polygon
    return { path, additionalPaths }
  }

  throw new Error([
    'Received or loaded annotation with invalid data.',
    '"data" field has the structure of a video,',
    'while the "subAnnotations" field has the structure of an image or vice-versa.'
  ].join(' '))
}
