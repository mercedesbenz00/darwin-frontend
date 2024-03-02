import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const findDatasetDetailsById: Getter<DatasetState, RootState> = (state) => (id: number) => {
  const index = state.datasetDetails.findIndex(d => d.id === id)
  return state.datasetDetails[index]
}
