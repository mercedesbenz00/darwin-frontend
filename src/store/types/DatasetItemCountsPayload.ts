import { DatasetItemStatus } from './DatasetItemStatus'

/**
 * This is what the backend returns from
 *
 * `GET /datasets/:dataset_id/item_counts`
 *
 * What we then push into the store is the `DatasetDetailsPayload` which is
 * this + id of the dataset.
 */
export type DatasetItemCountsPayload = DatasetGeneralCountsPayload & {
  /* eslint-disable camelcase */
  class_counts: DatasetClassCountsPayload[]
  status_counts: DatasetStatusCountsPayload[]
  /* eslint-enable camelcase */
}

export type DatasetGeneralCountsPayload = {
  /* eslint-disable camelcase */
  commented_item_count: number
  item_count: number
  unfiltered_item_count: number
  /* eslint-enable camelcase */
}

export type V2DatasetGeneralCountsPayload = {
  /* eslint-disable camelcase */
  simple_counts: DatasetGeneralSimpleCount[]
  /* eslint-enable camelcase */
}

type DatasetGeneralSimpleCount = {
  /* eslint-disable camelcase */
  dataset_id: number
  filtered_item_count: number
  unfiltered_item_count: number
  /* eslint-enable camelcase */
}

export type DatasetStatusCountsPayload = {
  /* eslint-disable camelcase */
  count: number,
  status: DatasetItemStatus | 'all'
  /* eslint-enable camelcase */
}

type DatasetStatusSimpleCount = {
  /* eslint-disable camelcase */
  dataset_id: number,
  item_count: number,
  status: DatasetItemStatus
  /* eslint-enable camelcase */
}

type DatasetStatusDetailedCount = {
  /* eslint-disable camelcase */
  archived: boolean,
  dataset_id: number,
  item_count: number,
  processing_status: DatasetItemStatus,
  workflow_status: DatasetItemStatus,
  /* eslint-enable camelcase */
}

export type V2DatasetStatusCountsPayload = {
  /* eslint-disable camelcase */
  detailed_counts: DatasetStatusDetailedCount[],
  simple_counts: DatasetStatusSimpleCount[]
  /* eslint-enable camelcase */
}

export type DatasetClassCountsPayload = {
  /* eslint-disable camelcase */
  id: number,
  name: string,
  count: number
  /* eslint-enable camelcase */
}
type DatasetClassSimpleCount = {
  /* eslint-disable camelcase */
  annotation_class_id: number,
  dataset_id: number,
  item_count: number
  /* eslint-enable camelcase */
}

export type V2DatasetClassCountsPayload = {
  /* eslint-disable camelcase */
  simple_counts: DatasetClassSimpleCount[]
  /* eslint-enable camelcase */
}

export type V2ItemsStageCountsPayload = {
  simple_counts: {
    dataset_id: number
    item_count: number
    stage_id: string
  }[]
}
