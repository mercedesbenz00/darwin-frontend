import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

import { Attributes } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const attributesData = data as Attributes
    return attributesData.attributes
  },

  deserialize (rawData: any): AnnotationData {
    return {
      attributes: rawData.attributes.attributes
    }
  }
}
