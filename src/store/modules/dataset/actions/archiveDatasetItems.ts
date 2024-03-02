import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload, StoreActionPayload } from '@/store/types'
import { archiveItems } from '@/utils/backend'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filter: DatasetItemFilter
}

/**
 * Archives (soft deletes) all specified items belonging to the specified dataset
 */
export const archiveDatasetItems: DatasetAction<Payload> =
  async ({ commit, dispatch }, payload) => {
    const { dataset, filter } = payload
    const response = await archiveItems({ datasetId: dataset.id, filter })

    if ('data' in response) {
      commit('ARCHIVE_SELECTED_DATASET_ITEMS')
      const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
      dispatch('loadDatasetItemCountsThrottled', countsPayload)
    }

    return response
  }
