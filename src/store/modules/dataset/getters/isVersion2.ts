import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const isVersion2: Getter<DatasetState, RootState> = (state, getters) => {
  if (!state.currentDataset.id) { return false }
  const datasetPayload = getters.findById(state.currentDataset.id)
  return datasetPayload.version === 2
}
