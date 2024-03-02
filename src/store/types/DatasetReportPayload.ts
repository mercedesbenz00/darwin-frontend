import { DatasetItemStatus } from './DatasetItemStatus'

export type DatasetReportClassDistributionPayload = {
  id: number
  name: string
  count: number
}

export type DatasetReportPayload = {
  /* eslint-disable camelcase */
  id: number
  progress: number
  item_count: number
  annotator_count: number
  items_by_status: { status: DatasetItemStatus; count: number }[]
  class_distribution_by_item: DatasetReportClassDistributionPayload[]
  class_distribution_by_annotation_instance: DatasetReportClassDistributionPayload[]
  /* eslint-enable camelcase */
}
