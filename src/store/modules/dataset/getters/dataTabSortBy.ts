import { Getter } from 'vuex'

import { DatasetState } from '@/store/modules/dataset/state'
import { RootState } from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { getDatasetDefaultSortOptions } from '@/utils'

export const dataTabSortBy: Getter<DatasetState, RootState> = (state) =>
  (dataset: DatasetPayload): string => {
    const defaultSortOptions = getDatasetDefaultSortOptions(dataset)
    if (!defaultSortOptions) {
      throw new Error(`Cannot find default sort options from the dataset ${dataset.id}`)
    }
    const { sortBy: defaultSortBy } = defaultSortOptions
    const { sort } = state.datasetItemFilter
    if (!sort) { return defaultSortBy }
    return Object.keys(sort)[0] || defaultSortBy
  }
