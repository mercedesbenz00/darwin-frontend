import { RasterTypeSerializer } from '@/engineV2/managers'
import { Raster, AnnotationData, BoundingBoxData } from '@/engineV2/models'

import { encodeSparseRLE, EncodeSparseRLEBounds } from './rle/sparseRle'

type RawData = { mask: { bounding_box: BoundingBoxData } }

export const serializer: RasterTypeSerializer = {
  serialize (data: AnnotationData, raster: Raster, annotationId: string): any {
    const bounding_box = data.bounding_box
    const labelIndex = raster.getLabelIndexForAnnotationId(annotationId)

    if (labelIndex === undefined) {
      /**
       * labelIndex is not yet defined, so can't get sparse_rle data
       * for this annotation.
       */
      
      return {
        mask: {
          sparse_rle: []
        }
      }
    }

    let bounds: EncodeSparseRLEBounds | undefined

    if (bounding_box !== undefined) {
      bounds = {
        maskWidth: raster.width,
        topLeft: {
          x: bounding_box.x,
          y: bounding_box.y
        },
        bottomRight: {
          x: bounding_box.x + bounding_box.w,
          y: bounding_box.y + bounding_box.h
        }
      }
    }

    const mask = raster.buffer
    const sparse_rle = encodeSparseRLE(mask, labelIndex, bounds)

    return {
      mask: {
        sparse_rle,
        bounding_box: bounding_box
      }
    }
  },

  deserialize (rawData: RawData, raster: Raster): AnnotationData {
    const { mask } = rawData
    const {  bounding_box } = mask
    const rasterId = raster.id

    return {
      rasterId: rasterId,
      bounding_box
    }
  }
}
