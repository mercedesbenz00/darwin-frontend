import { ToolContext } from '@/engineV2/managers'
import {
  Annotation,
  AutoAnnotateData,
  ImageAnnotation,
  isImageSubAnnotations,
  VideoAnnotation
} from '@/engineV2/models'
import { Polygon } from '@/engineV2/plugins/polygon/types'

/**
 * Mutates video annotation data field with new clicker data at the current frame
 * index.
 *
 * This includes
 *
 * - new polygon data replacing annotation.data
 * - a new auto_annotate sub being added into annotation.subAnnotations
 */
const updateVideoAnnotationClickerData = (
  annotation: VideoAnnotation,
  newPolygonData: Polygon,
  newAutoAnnotateData: AutoAnnotateData,
  context: ToolContext
) => {
  // video annotation has different data for every frame, so we need to deep-merge
  // at current frame index
  const frameIndex = context.editor.activeView.currentFrameIndex
  if (frameIndex === undefined || frameIndex === -1) {
    throw new Error('Clicker: Trying to update video annotation without video loaded')
  }

  const frame = annotation.data.frames[frameIndex]

  annotation.data.frames[frameIndex] = {
    ...frame,
    ...newPolygonData,
    auto_annotate: newAutoAnnotateData
  }
}

/**
 * Mutates image annotation data field with a new clicker payload.
 *
 * This includes
 *
 * - new polygon data replacing annotation.data
 * - a new auto_annotate sub being added into annotation.subAnnotations
 */
const updateImageAutoAnnotateSub = (
  annotation: ImageAnnotation,
  newPolygonData: Polygon,
  newAutoAnnotateData: AutoAnnotateData,
  context: ToolContext
): void => {
  if (!isImageSubAnnotations(annotation.subAnnotations)) {
    throw new Error('Clicker: Image annotation subannotations are in incorrect format')
  }

  const autoAnnotateSub = context.editor.activeView.annotationManager.initializeSubAnnotation(
    'auto_annotate',
    annotation,
    newAutoAnnotateData
  )

  if (!autoAnnotateSub) {
    throw new Error("Clicker: Couldn't initialize auto annotate sub for image annotation")
  }

  const index =
    annotation.subAnnotations.findIndex(elem => elem.id === autoAnnotateSub.id)

  if (index !== -1) {
    annotation.subAnnotations.splice(index, 1)
  }

  annotation.subAnnotations.push(autoAnnotateSub)
  annotation.data = newPolygonData
}

/**
 * Mutates image or video annotation with new clicker data
 *
 * This includes
 *
 * - data for the new polygon
 * - data about the clicker itself
 *
 * The annotation is mutated directly.
 *
 * Image and video annotations are handled differently.
 */
export const updateClickerData = (
  annotation: Annotation,
  newPolygonData: Polygon,
  newAutoAnnotateData: AutoAnnotateData,
  context: ToolContext
): Annotation => {
  if (annotation.isVideoAnnotation()) {
    updateVideoAnnotationClickerData(annotation, newPolygonData, newAutoAnnotateData, context)
  }

  if (annotation.isImageAnnotation()) {
    updateImageAutoAnnotateSub(annotation, newPolygonData, newAutoAnnotateData, context)
  }

  return annotation
}
