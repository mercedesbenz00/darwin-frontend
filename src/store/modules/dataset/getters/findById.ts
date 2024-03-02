import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'

export const findById: Getter<DatasetState, RootState> = (state) =>
  (datasetId: number): DatasetPayload | null => state.datasets.find(p => p.id === datasetId) || null
