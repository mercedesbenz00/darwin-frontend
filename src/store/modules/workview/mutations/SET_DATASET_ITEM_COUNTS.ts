import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemCountsPayload } from '@/store/types/DatasetItemCountsPayload'

export const SET_DATASET_ITEM_COUNTS: WorkflowMutation<DatasetItemCountsPayload> =
  (state, data) => {
    state.datasetItemCounts = data
  }
