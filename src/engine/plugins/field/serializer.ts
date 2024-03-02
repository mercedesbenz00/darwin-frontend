import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

import { String } from './types'

interface SerializedString {
  string: String
}

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): SerializedString {
    const { sources } = data as String
    return { string: { sources } }
  },

  deserialize (rawData: SerializedString): AnnotationData {
    const { sources } = rawData.string
    return { sources }
  }
}
