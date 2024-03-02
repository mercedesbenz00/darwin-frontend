import { DatasetItemCountsPayload } from '@/store/types'

type BuildParams = Partial<DatasetItemCountsPayload>

export const buildDatasetItemsCountPayload =
  (params: BuildParams = {}): DatasetItemCountsPayload => ({
    class_counts: [],
    item_count: 0,
    commented_item_count: 0,
    status_counts: [],
    unfiltered_item_count: 0,
    ...params
  })
