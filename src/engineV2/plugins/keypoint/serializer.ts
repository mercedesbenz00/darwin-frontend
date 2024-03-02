import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Keypoint } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const { x, y } = data as Keypoint
    return { keypoint: { x, y } }
  },

  deserialize (rawData: any): Keypoint {
    return rawData.keypoint
  }
}
