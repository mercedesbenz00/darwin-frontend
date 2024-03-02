import { PaginationParams } from '@/store/types/PaginationTypes'

import { DatasetItemStatus } from './DatasetItemStatus'
import { DatasetItemType } from './DatasetItemType'

/* eslint-disable camelcase */
export type DatasetItemFilter = {
  annotation_class_ids?: number[]
  not_annotation_class_ids?: number[]

  assignees?: number[]
  not_assignees?: number[]

  current_assignees?: number[]
  not_current_assignees?: number[] // not sure if we need this filter

  dataset_item_ids?: number[]
  not_dataset_item_ids?: number[]

  filename_contains?: string
  not_filename_contains?: string // not sure if we need this filter

  filenames?: string[]
  not_filenames?: string[]

  has_comments?: boolean
  page?: PaginationParams

  path?: string
  not_path?: string // not sure if we need this filter

  paths?: string[]
  not_paths?: string[]

  sort?: { [key: string]: 'asc' | 'desc' }

  statuses?: DatasetItemStatus[]
  not_statuses?: DatasetItemStatus[]

  types?: DatasetItemType[]
  not_types?: DatasetItemType[]

  /**
   * This flag includes playback videos' frame items in the filter, no matter their statuses.
   * For now, it's only used to count the number of frames of filtered videos when training a
   * new model.
   */
  unroll_videos?: boolean

  video_ids?: number[]
  not_video_ids?: number[]

  workflow_stage_template_ids?: number[]
  not_workflow_stage_template_ids?: number[]

  /**
   * WORKFLOWS 2.0 only, when specified, includes only items currently in one of the specified
   * stages.
   */
  current_workflow_stage_ids?: string[]

  /**
   * WORKFLOWS 2.0 only, when specified, includes only items currently NOT in one of the specified
   * stages.
   */
  not_current_workflow_stage_ids?: string[]
}
/* eslint-enable camelcase */
