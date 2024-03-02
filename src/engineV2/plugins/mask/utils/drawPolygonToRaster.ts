import { BoundingBoxData, Raster } from '@/engineV2/models'
import {
  Annotation
} from '@/engineV2/models'
import { checkAndRemoveEmptyMasks } from '@/engineV2/plugins/mask/utils/shared'
import { View } from '@/engineV2/views'
import { polygonToRaster, PolygonToRasterResult } from '@/utils'

import {
  getOrCreateRasterForView,
  getAnnotationForClassIdOnRaster,
  createMaskAnnotation
} from './shared'

/**
 * Finds the label index of the mask annotation on the raster,
 * or returns the next available label index if the annotation is new
 * @param raster The raster object
 * @param annotation The annotation to query.
 * @returns The appropriate label index for the raster.
 */
function getLabelIndex (raster: Raster, annotation?: Annotation): number {
  if (annotation !== undefined) {
    const labelIndex = raster.getLabelIndexForAnnotationId(annotation.id)

    if (labelIndex === undefined) {
      throw new Error('Exisitng annotation has no mapping to raster.')
    }

    return labelIndex
  }

  return raster.getNextAvailableLabelIndex()
}

/**
 * Paints the polygon to the given raster object.
 *
 * @param raster The raster object
 * @param polygon The polygon layer.
 * @param labelIndex The labelIndex to paint to the raster object.
 *
 * @returns The rasterized polygon's extent and labelmap indicies painted.
 */
function updateRasterMask (
  view: View,
  raster: Raster,
  polygon: any,
  labelIndex: number
): PolygonToRasterResult {
  const mask: Uint8Array = raster.buffer
  const rasterizedPolygon = polygonToRaster(polygon.path, raster.width)
  const labelsBeingOverwritten: Set<number> = new Set()

  // Update mask
  rasterizedPolygon.data.forEach((index: number): void => {
    if (mask[index] !== labelIndex && mask[index] !== 0) {
      labelsBeingOverwritten.add(mask[index])
    }
    mask[index] = labelIndex
  })

  const labelsBeingOverwrittenArray = Array.from(labelsBeingOverwritten)

  checkAndRemoveEmptyMasks(view, raster, labelsBeingOverwrittenArray)

  return rasterizedPolygon
}

/**
 * Updates an annotation, calculating and saving its new labelmap.
 *
 * @param view The view on which the raster lives.
 * @param annotation The annotation to update
 * @param boundingBox The bounding box of the edited region of
 * the annotation on the labelmap.
 */
function updateAnnotation (
  view: View,
  annotation: Annotation,
  boundingBox: BoundingBoxData,
): void {
  // Update annotation
  if (!annotation.isRasterAnnotation()) {
    throw new Error(
      'Annotation in this routine should be a Raster Annotation'
    )
  }
  const annotationBoundingBox = annotation.data.bounding_box

  if (annotationBoundingBox === undefined) {
    throw new Error('No bounding box for existing annotation')
  }

  // Note: The minus 1 is due to us needing to find the _pixel_ indicies.
  // For example if boundingBox.x === 2 and boundingBox.w === 2,
  // Then the min should be 2, and the max index should be 4.
  let minX = boundingBox.x
  let maxX = boundingBox.x + boundingBox.w - 1
  let minY = boundingBox.y
  let maxY = boundingBox.y + boundingBox.h - 1

  const points = [
    {
      x: annotationBoundingBox.x,
      y: annotationBoundingBox.y
    },
    {
      x: annotationBoundingBox.x + annotationBoundingBox.w - 1,
      y: annotationBoundingBox.y + annotationBoundingBox.h - 1
    }
  ]

  points.forEach((point: {x: number, y: number}) => {
    const {x, y} = point
    if (minX > x) {
      minX = x
    }
    if (maxX < x) {
      maxX = x
    }
    if (minY > y) {
      minY = y
    }
    if (maxY < y) {
      maxY = y
    }
  })

  view.annotationManager.updateAnnotationData(annotation, {
    bounding_box: {
      x: minX,
      y: minY,
      w: maxX - minX + 1,
      h: maxY - minY + 1
    },
    rasterId: annotation.data.rasterId
  })

  view.annotationManager.updateAnnotation(annotation)
}

/**
 * Draws the given polygon to the raster on the view.
 * @param view The view containing the image to draw to.
 * @param polygon The polygon.
 * @param classId The Id of the class to paint the polygon as
 * on the raster.
 * @returns A promise resolving to the associated new/modified
 * mask annotation.
 */
export async function drawPolygonToRaster (
  view: View,
  polygon: any,
  classId: number
): Promise<Annotation | void> {
  const raster = getOrCreateRasterForView(view)

  let annotation = getAnnotationForClassIdOnRaster(view, raster, classId)

  const labelIndex = getLabelIndex(raster, annotation)
  const rasterizedPolygon = updateRasterMask(view, raster, polygon, labelIndex)

  const boundingBox: BoundingBoxData = rasterizedPolygon.boundingBox

  if (annotation) {
    updateAnnotation(view, annotation, boundingBox)
  } else {
    annotation = await createMaskAnnotation(view, raster, boundingBox, labelIndex)
  }

  raster.invalidate(
    rasterizedPolygon.coords.minX,
    rasterizedPolygon.coords.maxX,
    rasterizedPolygon.coords.minY,
    rasterizedPolygon.coords.maxY
  )

  return annotation
}
