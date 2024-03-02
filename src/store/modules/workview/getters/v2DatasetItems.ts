import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { RootState } from '@/store/types'

export const v2DatasetItems: Getter<WorkviewState, RootState> =
  (state, getters, rootState) =>
    Object.values(rootState.dataset.datasetItemsV2)
