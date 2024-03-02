import { Getter } from 'vuex'

import { AClassState } from '@/store/modules/aclass/state'
import { RootState } from '@/store/types'

export const mainAnnotationTypes: Getter<AClassState, RootState> = (state) =>
  state.types.filter(annotationType => annotationType.granularity === 'main')
