import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

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
