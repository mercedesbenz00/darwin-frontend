import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { addPriorityToItems as request } from '@/utils/backend'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filter: DatasetItemFilter
  priority: number
}

/**
 * Add priority to a collection of dataset items
 * @param dataset Dataset
 * @param datasetItems Dataset items
 * @param priority New priority
 */
export const addPriorityToItems: DatasetAction<Payload> = async (
  { commit, dispatch },
  { dataset, filter, priority }
) => {
  const response = await request({
    datasetId: dataset.id,
    filter,
    priority
  })

  if ('error' in response) { return response }

  commit('SET_SELECTED_ITEMS_PRIORITY', priority)
  const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
  dispatch('loadDatasetItemCountsThrottled', countsPayload)

  return response
}
