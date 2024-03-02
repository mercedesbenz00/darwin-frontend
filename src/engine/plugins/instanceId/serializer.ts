import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

import { InstanceID } from './types'

export const serializer: AnnotationTypeSerializer = {
  serialize (data: AnnotationData): any {
    const instanceIDData = data as InstanceID
    return { value: instanceIDData.value }
  },

  deserialize (rawData: any): AnnotationData {
    return { value: rawData.instance_id.value }
  },

  defaultData (): AnnotationData {
    return { value: 0 }
  }
}
