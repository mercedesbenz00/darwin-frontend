import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { restoreItems } from '@/utils/backend'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filter: DatasetItemFilter
}

/**
 * Restores all specified items belonging to the specified dataset
 */
export const restoreDatasetItems: DatasetAction<Payload> =
  async ({ commit, dispatch }, payload) => {
    const { dataset, filter } = payload
    const response = await restoreItems({ datasetId: dataset.id, filter })

    if ('error' in response) { return response }

    commit('RESTORE_SELECTED_DATASET_ITEMS')
    const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
    dispatch('loadDatasetItemCountsThrottled', countsPayload)

    return response
  }
