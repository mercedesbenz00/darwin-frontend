import { PaginationParams } from '@/store/types/PaginationTypes'

import { DatasetItemStatus } from './DatasetItemStatus'
import { DatasetItemType } from './DatasetItemType'

/* eslint-disable camelcase */
export type V2DatasetItemFilter = {
  annotation_class_ids?: number[]
  not_annotation_class_ids?: number[]

  assignees?: number[]
  not_assignees?: number[]

  has_comments?: boolean
  page?: PaginationParams

  sort?: { [key: string]: 'asc' | 'desc' }

  statuses?: DatasetItemStatus[]
  not_statuses?: DatasetItemStatus[]

  types?: DatasetItemType[]
  not_types?: DatasetItemType[]

  // V2 fields
  item_path_prefix?: string
  not_item_path_prefix?: string

  item_paths?: string[]
  not_item_paths?: string[]

  item_ids?: string[]
  not_item_ids?: string[]

  item_names?: string[]
  not_item_names?: string[]

  item_name_prefix?: string
  not_item_name_prefix?: string

  item_name_contains?: string
  not_item_name_contains?: string

  workflow_stage_ids?: string[]
  not_workflow_stage_ids?: string[]

  annotators?: number[]
  not_annotators?: number[]

  reviewers?: number[]
  not_reviewers?: number[]

  dataset_ids?: number[]

  select_all?: boolean

  include_thumbnails?: boolean
  include_first_sections?: boolean
  include_tags?: boolean
  include_workflow_data?: boolean

  /**
   * This flag includes playback videos' frame items in the filter, no matter their statuses.
   * For now, it's only used to count the number of frames of filtered videos when training a
   * new model.
   */
  unroll_videos?: boolean

  video_ids?: number[]
  not_video_ids?: number[]
}
/* eslint-enable camelcase */
