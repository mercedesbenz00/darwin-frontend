import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

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
