import { v4 as uuidv4 } from 'uuid'

import { BoundingBoxData, Raster } from '@/engineV2/models'
import {
  Annotation
} from '@/engineV2/models'
import { View } from '@/engineV2/views'

/**
 * Creates a new mask annotation and associates it with the raster.
 *
 * @param view The view on which the raster lives.
 * @param raster The raster object
 * @param boundingBox The bounding box to set on the annotation data.
 * @param labelIndex The label index of the annotation on the raster
 *
 * @returns A promise which resolves to the new annotation
 */
export async function createMaskAnnotation (
  view: View,
  raster: Raster,
  boundingBox: BoundingBoxData,
  labelIndex: number
): Promise<Annotation> {
  // Create Annotation
  const annotationId = uuidv4()

  raster.setAnnotationMapping(labelIndex, annotationId)

  return await view
    .annotationManager
    .createAnnotationAction({
      type: 'mask',
      id: annotationId,
      data: {
        rasterId: raster.id,
        // Defines the extent which the segment occupies on the image pixels.
        bounding_box: boundingBox
      }})
}
