import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

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
