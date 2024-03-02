import { DatasetItemStatus } from '@/store/types'

export const ASSIGNABLE_STATUSES = [DatasetItemStatus.annotate, DatasetItemStatus.review]

export const NON_WORKFLOW_STATUSES = [
  DatasetItemStatus.archived,
  DatasetItemStatus.error,
  DatasetItemStatus.new,
  DatasetItemStatus.processing,
  DatasetItemStatus.uploading
]
