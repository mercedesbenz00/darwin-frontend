import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

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
