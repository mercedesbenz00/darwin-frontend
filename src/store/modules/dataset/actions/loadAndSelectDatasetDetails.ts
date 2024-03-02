import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetPayload, StoreActionPayload, StoreActionResponse } from '@/store/types'
import { DatasetDetailPayload } from '@/store/types/DatasetDetailPayload'
import { DatasetItemCountsPayload } from '@/store/types/DatasetItemCountsPayload'

import { loadDatasetItemCounts } from './loadDatasetItemCounts'

type Action = DatasetAction<{ dataset: DatasetPayload }, DatasetItemCountsPayload>

/**
 * Load item counts for a dataset
 */
const loadAndSelectDatasetDetails: Action = async ({ commit, dispatch }, { dataset }) => {
  const payload: StoreActionPayload<typeof loadDatasetItemCounts> = { dataset }
  const response: StoreActionResponse<typeof loadDatasetItemCounts> =
    await dispatch('loadDatasetItemCounts', payload)

  if ('data' in response) {
    const details: DatasetDetailPayload = { ...response.data, id: dataset.id }
    commit('PUSH_DATASET_DETAILS', details)
    commit('SET_CURRENT_DATASET_DETAILS', details)
    commit('SET_CURRENT_DATASET_ERROR', null)
    commit('SET_CURRENT_DATASET_METADATA', null)
    commit('SET_CURRENT_DATASET_LOADED')
  }

  if ('error' in response) {
    commit('SET_CURRENT_DATASET_ERROR', response.error)
    commit('SET_CURRENT_DATASET_LOADING', false)
  }

  return response
}

export default loadAndSelectDatasetDetails
