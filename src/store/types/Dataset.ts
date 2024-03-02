import { PageMetadata } from '@/store/types/PaginationTypes'

import { DatasetItemCountsPayload } from './DatasetItemCountsPayload'

type Metadata = PageMetadata
/* eslint-enable camelcase */

export type Dataset = {
  slug: string
  annotationProgress: number
  attributes?: {id: string, name: string, classId: number}[]
  classCounts: DatasetItemCountsPayload['class_counts']
  error?: any
  id: null | number
  loaded: boolean
  metadata: null | Metadata
  numImages: DatasetItemCountsPayload['item_count']
  numVideos: number
  unfilteredItemCount: DatasetItemCountsPayload['unfiltered_item_count']
  size: number
  statusCounts: DatasetItemCountsPayload['status_counts']
  videos: [],

  /* eslint-disable camelcase */
  team_slug: string
  /* eslint-enable camelcase */
}
