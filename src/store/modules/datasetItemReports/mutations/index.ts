import { MutationTree } from 'vuex'

import { DatasetItemReportsState } from '@/store/modules/datasetItemReports/state'

import { DELETE_REPORT } from './DELETE_REPORT'
import { PUSH_REPORT } from './PUSH_REPORT'
import { SET_REPORT } from './SET_REPORT'
import { SET_REPORTS } from './SET_REPORTS'

export const mutations: MutationTree<DatasetItemReportsState> = {
  SET_REPORTS,
  SET_REPORT,
  PUSH_REPORT,
  DELETE_REPORT
}
