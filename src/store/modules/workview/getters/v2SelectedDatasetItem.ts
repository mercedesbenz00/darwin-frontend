import { Getter } from 'vuex'

import { WorkviewState } from '@/store/modules/workview/state'
import { RootState, V2DatasetItemPayload } from '@/store/types'

export const v2SelectedDatasetItem: Getter<WorkviewState, RootState> =
  (state, getters) =>
    getters.v2DatasetItems
      .find((d: V2DatasetItemPayload) => d.id === state.selectedDatasetItemV2Id) || null
