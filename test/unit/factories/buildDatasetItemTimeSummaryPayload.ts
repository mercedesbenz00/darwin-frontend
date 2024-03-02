import { DatasetItemTimeSummaryPayload } from '@/store/types'
type Params = Partial<DatasetItemTimeSummaryPayload>

export const buildDatasetItemTimeSummaryPayload =
  (params: Params = {}): DatasetItemTimeSummaryPayload => ({
    current_workflow: { per_stage_per_user: [] },
    dataset_item_id: -1,
    out_of_workflow: [],
    ...params
  })
