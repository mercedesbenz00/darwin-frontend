import {  MaskAnnotation, Raster } from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Checks if a mask annotation is empty (has no labelled pixels within its bounding box).
 *
 * @param annotation The annotation to check
 * @param raster The raster associated with the annotation.
 *
 * @returns True if the annotation mask is empty.
 */
function isMaskAnnotationEmpty (
  annotation: MaskAnnotation,
  raster: Raster
): boolean {
  const boundingBox = annotation.data.bounding_box
  const labelIndex = raster.getLabelIndexForAnnotationId(annotation.id)

  const { width, height, buffer: mask } = raster

  let xMin: number
  let xMax: number
  let yMin: number
  let yMax: number

  if (boundingBox) {
    xMin = boundingBox.x
    xMax = boundingBox.x + boundingBox.w - 1
    yMin = boundingBox.y
    yMax = boundingBox.y + boundingBox.h - 1
  } else {
    xMin = 0
    xMax = width - 1
    yMin = 0
    yMax = height - 1
  }

  for (let y = yMin; y <= yMax; y++) {
    for (let x = xMin; x <= xMax; x++) {
      if (mask[y * width + x] === labelIndex) {
        // Found -at least one- pixel labelled, jump out early
        return false
      }
    }
  }

  // Found no labelled pixels
  return true
}

/**
 * Checks if the given labels on a raster map are empty within the
 * regions defined by mask annotations. If any annotations are empty,
 * delete these annotations.
 *
 * @param view The view on which the raster layer sits.
 * @param raster The raster mask.
 * @param labelsBeingOverwritten The labels to query.
 * If you have a tool which interacts with the raster layer, the tool
 * should keep track of what classes are being overwritten with this
 * action, and then call this helper to check if classes need to be removed.
 */
const checkAndRemoveEmptyMasks = (
  view: View,
  raster: Raster,
  labelsBeingOverwritten: number[]
): void => {
  const annotations: MaskAnnotation[] = []

  labelsBeingOverwritten.forEach((labelIndex: number) => {
    const annotationId = raster.getAnnotationMapping(labelIndex)

    if (annotationId === undefined) {
      // Annotation might have already been deleted by
      // another recent action, already removed so fail gracefully.
      return
    }

    const annotation = view.annotationManager.getAnnotation(annotationId)

    if (annotation && annotation.isRasterAnnotation()) {
      annotations.push(annotation)
    }
  })

  const annotationsCompletelyRemoved: MaskAnnotation[] = annotations.filter(
    (annotation: MaskAnnotation) => isMaskAnnotationEmpty(annotation, raster)
  )

  annotationsCompletelyRemoved.forEach((annotation: MaskAnnotation) => {
    view.annotationManager.deleteAnnotation(annotation)
  })
}

export { checkAndRemoveEmptyMasks }
