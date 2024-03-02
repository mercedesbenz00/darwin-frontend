import { WorkviewAction } from '@/store/modules/workview/types'
import { DatasetItemFilter } from '@/store/types'
import { isEqualDatasetItemFilter } from '@/utils'

type SetDatasetItemFilterAction = WorkviewAction<DatasetItemFilter, null>

const setDatasetItemFilter: SetDatasetItemFilterAction = ({ commit, state }, filter) => {
  const isSameFilter = isEqualDatasetItemFilter(filter, state.datasetItemFilter)
  if (isSameFilter) { return }

  commit('SET_DATASET_ITEMS_FILTER', filter)
  commit('SET_SELECTED_DATASET_ITEM', null)
  commit('CLEAR_DATASET_ITEMS')
  commit('CLEAR_DATASET_ITEM_PAGE_REGISTRY')
  return { data: null }
}

export default setDatasetItemFilter
