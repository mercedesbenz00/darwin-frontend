import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'

export const SET_DATASET_ITEMS_FILTER: WorkflowMutation<DatasetItemFilter> =
  (state, data) => { state.datasetItemFilter = data }
