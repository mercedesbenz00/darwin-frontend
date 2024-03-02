import { StageType } from './StageType'

export enum DatasetItemStatus {
  archive = 'archive',
  annotate = 'annotate',
  consensus_entrypoint = 'consensus_entrypoint',
  logic = 'logic',
  complete = 'complete',
  error = 'error',
  archived = 'archived',
  new = 'new',
  processing = 'processing',
  review = 'review',
  code = 'code',
  uploading = 'uploading',
  webhook = 'webhook'
}

export const ITEM_STATUSES: { [key in DatasetItemStatus | StageType]: string } = {
  archive: 'Being archived',
  annotate: 'Being annotated',
  archived: 'Archived',
  code: 'Code',
  complete: 'Complete',
  consensus_entrypoint: 'Consensus',
  consensus_test: 'Consensus',
  logic: 'Logic',
  dataset: 'New',
  discard: 'Archive',
  error: 'Error',
  model: 'Model',
  new: 'New',
  processing: 'Processing',
  review: 'In Review',
  test: 'Test',
  uploading: 'Uploading',
  webhook: 'Webhook'
}

export const getDatasetItemStatusLabel =
  (status: DatasetItemStatus | StageType): string => ITEM_STATUSES[status]

export const isDatasetItemStatus = (status: string): status is DatasetItemStatus =>
  (Object.values(DatasetItemStatus) as string[]).includes(status)
