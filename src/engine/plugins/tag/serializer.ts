import { AnnotationTypeSerializer } from '@/engine/managers'
import { AnnotationData } from '@/engine/models'

import { Tag } from './type'

export const serializer: AnnotationTypeSerializer<Tag> = {
  serialize (data: AnnotationData): any {
    /*
      copy data, because it's prevent case when data was provided by Vuex store
      so it's avoid mutation outside the store
    */
    return ({ ...data } as Tag)
  },

  deserialize (rawData: any): AnnotationData {
    return rawData
  }
}
