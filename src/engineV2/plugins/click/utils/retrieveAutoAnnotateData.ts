import {
  View,
  Annotation,
  AutoAnnotateData,
  ImageAnnotation,
  ImageSubAnnotation,
  isImageAnnotation,
  isVideoAnnotation,
  VideoAnnotation
} from '@/engineV2/models'
import { findClosestKeyFrame } from '@/engineV2/utils'

/**
 * Resolves auto_annotate data for a video annotation.
 *
 * Since an annotation could span multiple frames, the correct video data
 * depends on which frame the editor is currently on.
 *
 * This is either the first entry to the left of the current video frame, or
 * if there is no such entry, which could happen if the annotation was resized
 * to the left after creation, it's the first entry overall.
 */
const retrieveVideoAutoAnnotateData = (
  view: View,
  annotation: VideoAnnotation
): AutoAnnotateData | undefined => {
  const currentFrameIndex = view.currentFrameIndex
  if (currentFrameIndex === undefined || currentFrameIndex < 0) { return }

  const frame = findClosestKeyFrame(annotation, currentFrameIndex, 'auto_annotate')
  return frame?.auto_annotate
}

/**
 * Within an image annotation, finds the subannotation instance
 * containing auto_annotate/clicker data.
 */
export const retrieveImageAutoAnnotateSubAnnotation = (
  annotation: ImageAnnotation
): ImageSubAnnotation | undefined => {
  const sub = annotation.subAnnotations.find(s => s.type === 'auto_annotate')
  if (!sub) { return }
  if (!isImageAnnotation(sub)) {
    throw new Error(
      'ImageAnnotation is incorrectly structured. Subannotation looks like a frame subannotation'
    )
  }
  return sub
}

/**
 * Retrieves the contents of the auto_annotate key, if any,
 * within an image or video annotation.
 */
export const retrieveAutoAnnotateData = (
  annotationId: Annotation['id'],
  view: View
): AutoAnnotateData | undefined => {
  const annotation = view.annotationManager.getAnnotation(annotationId)
  if (!annotation) { return }
  if (isVideoAnnotation(annotation)) {
    return retrieveVideoAutoAnnotateData(view, annotation)
  }

  if (isImageAnnotation(annotation)) {
    return retrieveImageAutoAnnotateSubAnnotation(annotation)?.data
  }

  throw new Error([
    'Received or loaded annotation with invalid data.',
    '"data" field has the structure of a video,',
    'while the "subAnnotations" field has the structure of an image or vice-versa.'
  ].join(' '))
}
