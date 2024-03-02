import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

import { Link } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const { from, to } = data as Link
    return { link: { from, to } }
  },

  deserialize (rawData: any): AnnotationData {
    const { from, to } = rawData.link
    return { from, to }
  }
}
