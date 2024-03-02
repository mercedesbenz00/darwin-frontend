import { Getter } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { AnnotationClassPayload, AnnotationTypePayload, RootState } from '@/store/types'

type TypeOwner = Pick<AnnotationClassPayload, 'annotation_types'>

/**
 * For the specified annotation class, use the store data to retrieve full payload for all of its
 * annotation types.
 */
export const annotationTypesForClass: Getter<AClassState, RootState> = (state) =>
  (annotationClass: TypeOwner): AnnotationTypePayload[] =>
    state.types.filter(t => annotationClass.annotation_types.includes(t.name))
