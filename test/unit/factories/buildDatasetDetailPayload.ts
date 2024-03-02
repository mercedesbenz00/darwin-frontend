import { DatasetDetailPayload } from '@/store/types'

type BuildParams = Partial<DatasetDetailPayload>

export const buildDatasetDetailPayload =
  (params: BuildParams = {}): DatasetDetailPayload => ({
    class_counts: [],
    commented_item_count: 0,
    item_count: 0,
    id: -1,
    status_counts: [],
    unfiltered_item_count: 0,
    ...params
  })
