import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter } from '@/store/types/V2DatasetItemFilter'
import { isEqualV2DatasetItemFilter } from '@/utils'

export const setDatasetItemFilterV2: DatasetAction<V2DatasetItemFilter> = (
  { commit, state }, filter
) => {
  const isSameFilter = isEqualV2DatasetItemFilter(filter, state.datasetItemFilterV2)
  if (isSameFilter) { return }

  commit('SET_DATASET_ITEMS_FILTER_V2', filter)
}
