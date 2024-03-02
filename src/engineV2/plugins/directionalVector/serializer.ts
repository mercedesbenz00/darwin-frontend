import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { DirectionalVector } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const directionalVector = data as DirectionalVector
    return {
      directional_vector: {
        angle: directionalVector.angle,
        length: directionalVector.length
      }
    }
  },

  deserialize (rawData: any): AnnotationData {
    return {
      angle: rawData.directional_vector.angle,
      length: rawData.directional_vector.length
    }
  }
}
