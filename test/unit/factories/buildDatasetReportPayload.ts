import { DatasetReportPayload } from '@/store/types'

type Params = Partial<DatasetReportPayload>

export const buildDatasetReportPayload = (params: Params): DatasetReportPayload => ({
  annotator_count: 0,
  class_distribution_by_annotation_instance: [],
  class_distribution_by_item: [],
  id: -1,
  item_count: 0,
  items_by_status: [],
  progress: 0,
  ...params
})
