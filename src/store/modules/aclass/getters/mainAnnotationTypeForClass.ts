import { Getter } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { AnnotationClassPayload, AnnotationTypePayload, RootState } from '@/store/types'

type TypeOwner = Pick<AnnotationClassPayload, 'id' | 'annotation_types'>

/**
 * For the specified annotation class, use the store data to retrieve full payload for its
 * main annotation type.
 */
export const mainAnnotationTypeForClass: Getter<AClassState, RootState> = (state) =>
  (annotationClass: TypeOwner): AnnotationTypePayload => {
    const mainType = state.types
      .find(t => t.granularity === 'main' && annotationClass.annotation_types.includes(t.name))

    if (!mainType) {
      throw new Error(
        `Invalid store state. Couldn't find main type for class id: ${annotationClass.id}`
      )
    }

    return mainType
  }
