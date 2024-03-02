import { V2DatasetItemTimeSummaryPayload } from '@/store/types'
type Params = Partial<V2DatasetItemTimeSummaryPayload>

export const buildV2DatasetItemTimeSummaryPayload =
  (params: Params = {}): V2DatasetItemTimeSummaryPayload => ({
    current_workflow: { per_stage_per_user: [] },
    dataset_item_id: '1',
    out_of_workflow: [],
    ...params
  })
