import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'

export const findReportById: Getter<DatasetState, RootState> = state =>
  (datasetId: number) => state.reports.find(r => r.id === datasetId)
