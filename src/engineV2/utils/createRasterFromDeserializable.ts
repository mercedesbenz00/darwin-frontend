import { FeatureFlagsManager } from '@/engineV2/managers/featureFlagsManager'
import {
  View,
  Raster
} from '@/engineV2/models'
import { BoundingBoxData } from '@/engineV2/models/annotation'
import { decodeDenseRLE } from '@/engineV2/plugins/mask/rle/denseRle'
import { StageAnnotation } from '@/store/modules/workview/types'
import { ImageDataPayload } from '@/store/types'

export function createRasterFromDeserializable (
  view: View,
  rasterStageAnnotation: StageAnnotation,
  maskAnnotations: StageAnnotation[]
): Record<string,BoundingBoxData> {
  if (!FeatureFlagsManager.isOnRasters) {
    return {}
  }

  const imageDataPayload = <ImageDataPayload>rasterStageAnnotation.data

  if (imageDataPayload.raster_layer === undefined) {
    throw new Error('No raster_layer present on raster layer annotation')
  }

  // Check if raster already exists
  const existingRaster = view.rasterManager?.getRasterForFileInView()

  if (existingRaster) {
    // Already been processed during this client session, ignore.
    return {}
  }

  const raster = new Raster(view)
  view.rasterManager?.createRaster(raster)

  const rasterLayerDataPayload = imageDataPayload.raster_layer

  const maskAnnotationIdsMapping = rasterLayerDataPayload.mask_annotation_ids_mapping
  const denseRLE = rasterLayerDataPayload.dense_rle
  const totalPixels = rasterLayerDataPayload.total_pixels

  const annotationIds = Object.keys(maskAnnotationIdsMapping)

  annotationIds.forEach((annotationId: string) => {
    const labelIndex = maskAnnotationIdsMapping[annotationId]

    raster?.setAnnotationMapping(labelIndex, annotationId)
  })

  const file = view.fileManager.file

  if (file.metadata === undefined) {
    throw new Error('Image required to be loaded to unmap raster')
  }

  const { width } = file.metadata
  const { mask, boundsPerLabelIndex, totalBounds } = decodeDenseRLE(denseRLE, totalPixels, width)

  raster.buffer = mask

  // Invalidate only the region containing data.
  raster.invalidate(
    totalBounds.topLeft.x,
    totalBounds.bottomRight.x,
    totalBounds.topLeft.y,
    totalBounds.bottomRight.y
  )

  const boundingBoxPerAnnotationId: Record<string,BoundingBoxData> = {}

  maskAnnotations.forEach((stageAnnotation: StageAnnotation) => {
    const annotationId = stageAnnotation.id
    const labelIndex = maskAnnotationIdsMapping[annotationId]
    const bounds = boundsPerLabelIndex[labelIndex]

    const boundingBox = {
      x: bounds.topLeft.x,
      y: bounds.topLeft.y,
      w: bounds.bottomRight.x - bounds.topLeft.x,
      h: bounds.bottomRight.y - bounds.topLeft.y
    }

    const imageDataPayload = <ImageDataPayload>stageAnnotation.data

    if (imageDataPayload.mask === undefined) {
      throw new Error('Mask annotation does not have mask payload')
    }

    boundingBoxPerAnnotationId[annotationId] = boundingBox
  })

  return boundingBoxPerAnnotationId
}
