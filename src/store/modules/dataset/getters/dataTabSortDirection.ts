import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { getDatasetDefaultSortOptions } from '@/utils'

export const dataTabSortDirection: Getter<DatasetState, RootState> = (state) =>
  (dataset: DatasetPayload): 'asc' | 'desc' => {
    const defaultSortOptions = getDatasetDefaultSortOptions(dataset)
    if (!defaultSortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${dataset.id}`)
    }
    const { sortDirection: defaultSortDirection } = defaultSortOptions
    const { sort } = state.datasetItemFilter
    if (!sort) { return defaultSortDirection }
    return Object.values(sort)[0] || defaultSortDirection
  }
