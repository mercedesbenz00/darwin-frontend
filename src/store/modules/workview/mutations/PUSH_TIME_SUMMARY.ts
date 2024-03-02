import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemTimeSummaryPayload } from '@/store/types/DatasetItemTimeSummaryPayload'

export const PUSH_TIME_SUMMARY: WorkflowMutation<DatasetItemTimeSummaryPayload> =
  (state, data) => {
    const index =
      state.datasetItemTimeSummaries.findIndex(t => t.dataset_item_id === data.dataset_item_id)
    if (index === -1) {
      state.datasetItemTimeSummaries.push(data)
    } else {
      state.datasetItemTimeSummaries.splice(index, 1, data)
    }
  }
