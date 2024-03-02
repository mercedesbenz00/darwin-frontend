import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { isEqualDatasetItemFilter } from '@/utils'

export const setDatasetItemFilter: DatasetAction<DatasetItemFilter> = (
  { commit, state }, filter
) => {
  const isSameFilter = isEqualDatasetItemFilter(filter, state.datasetItemFilter)
  if (isSameFilter) { return }

  commit('SET_DATASET_ITEMS_FILTER', filter)
  commit('SET_DATASET_ITEMS', [])
}
