import { WorkflowMutation } from '@/store/modules/workview/types'
import { V2DatasetItemTimeSummaryPayload } from '@/store/types/V2DatasetItemTimeSummaryPayload'

export const PUSH_V2_TIME_SUMMARY: WorkflowMutation<V2DatasetItemTimeSummaryPayload> =
  (state, data) => {
    state.v2DatasetItemTimeSummaries[data.dataset_item_id] = data
  }
