import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

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
