import { GetterTree } from 'vuex'

import { DatasetItemReportsState } from '@/store/modules/datasetItemReports/state'
import { RootState } from '@/store/types'

import { reports } from './reports'

export const getters: GetterTree<DatasetItemReportsState, RootState> = {
  reports
}
