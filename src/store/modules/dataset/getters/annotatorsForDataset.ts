import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const annotatorsForDataset: Getter<DatasetState, RootState> =
  (state) => (datasetId: number) => state.annotators.filter(a => a.dataset_id === datasetId)
