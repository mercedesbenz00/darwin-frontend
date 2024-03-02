import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { deleteItems } from '@/utils/backend'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filter: DatasetItemFilter
}

/**
 * Perma-deletes all specified items (by filter) belonging to the specified dataset
 */
export const deleteDatasetItems: DatasetAction<Payload> = async ({ commit, dispatch }, payload) => {
  const { dataset, filter } = payload
  const response = await deleteItems({ datasetId: dataset.id, filter })

  if ('error' in response) { return response }

  commit('REMOVE_SELECTED_DATASET_ITEMS')
  const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
  dispatch('loadDatasetItemCountsThrottled', countsPayload)

  return response
}
