import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Text } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const textData = data as Text
    return textData.text
  },

  deserialize (rawData: any): AnnotationData {
    return {
      text: rawData.text.text
    }
  }
}
