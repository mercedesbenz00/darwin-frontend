import { ActionTree } from 'vuex'

import { DatasetItemReportsState } from '@/store/modules/datasetItemReports/state'
import { RootState } from '@/store/types'

import { createDatasetItemReport } from './createDatasetItemReport'
import { deleteDatasetItemReport } from './deleteDatasetItemReport'
import { loadDatasetItemReport } from './loadDatasetItemReport'
import { loadDatasetItemReports } from './loadDatasetItemReports'

export const actions: ActionTree<DatasetItemReportsState, RootState> = {
  loadDatasetItemReports,
  loadDatasetItemReport,
  createDatasetItemReport,
  deleteDatasetItemReport
}
