import { WorkviewAction } from '@/store/modules/workview/types'
import { loadDataset as tutorialFetchDataset } from '@/utils/tutorialBackend'

type Payload = {
  datasetId: number
} | {
  datasetSlug: string
  teamSlug: string
}

/**
 * Loads dataset from json if in tutorial mode and pushes directly to dataset store.
 *
 * If not on tutorial mode, simply proxies dispatch to dataset/getDataset
 */
const loadDataset: WorkviewAction<Payload> =
  async ({ commit, dispatch, state }, params) => {
    const request = (() => {
      if (state.tutorialMode) { return tutorialFetchDataset() }
      return dispatch('dataset/loadDataset', params, { root: true })
    })()

    const response = await request

    if ('data' in response) {
      commit('SET_DATASET', response.data)
    }

    // returns success response as well as error response from dataset store
    return response
  }

export default loadDataset
