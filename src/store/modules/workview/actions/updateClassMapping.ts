import { ClassMapping, WorkviewAction } from '@/store/modules/workview/types'

type Payload = { runningSessionId: string, classMapping: ClassMapping }

export const updateClassMapping: WorkviewAction<Payload, void> =
  ({ commit }, params) => {
    commit('SET_AUTO_ANNOTATE_CLASS_MAPPING', params)
  }
