import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { AnnotationClassPayload, RootState } from '@/store/types'

/**
 * Get non-tag annotation classes
 */
export const nonTagAnnotationClasses: Getter<WorkviewState, RootState> =
  (state, getters, rootState): AnnotationClassPayload[] =>
    rootState.aclass.classes.filter(aclass => !aclass.annotation_types.includes('tag'))
