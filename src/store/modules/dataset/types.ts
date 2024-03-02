import { TypedAction, TypedMutation, RootState, V2DatasetItemFilter } from '@/store/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

import { DatasetState } from './state'

export type DatasetAction<T, R = any> = TypedAction<DatasetState, RootState, T, R>
export type DatasetMutation<R = any> = TypedMutation<DatasetState, R>

export type DeleteDatasetImageSetParams = { datasetId: number, setId: number }

export type AddPriorityToItemsParams = {
  datasetId: number
  datasetItems: DatasetItemPayload[]
  priority: number
}

export type Poller = {
  period: number
  callsWithoutChange: number
  id: number
  timestamp: number
  timeoutHandle?: number
}

export type ExportAnnotationFilterParams = {
  /* eslint-disable camelcase */
  annotation_class_ids?: number[]
  /* eslint-enable camelcase */
}

export type ExportDatasetFilterParams = Omit<DatasetItemFilter, 'page' | 'sort'>

export type ExportDatasetParams = {
  annotationFilter: ExportAnnotationFilterParams
  datasetId: number
  filter: ExportDatasetFilterParams
  format: string
  includeAuthorship: boolean
  includeExportToken: boolean
  name: string
}

export type ExportV2DatasetFilterParams = Omit<V2DatasetItemFilter, 'page' | 'sort'>

export type ExportV2Params = {
  annotationFilter: ExportAnnotationFilterParams
  datasetSlug: string
  filters: ExportV2DatasetFilterParams
  format: string
  includeAuthorship: boolean
  includeExportToken: boolean
  name: string
  teamSlug: string
}
