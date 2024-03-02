import { AnnotationTypeSerializer } from '@/engineV2/managers'
import { AnnotationData } from '@/engineV2/models'

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
