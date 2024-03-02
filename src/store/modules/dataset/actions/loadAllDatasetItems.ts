import { DatasetAction, Poller } from '@/store/modules/dataset/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { PaginationParams } from '@/store/types/PaginationTypes'
import { loadDatasetItems } from '@/utils/backend'

type PollDatasetItemsParams = { datasetId: number, filter?: DatasetItemFilter }

/**
 * Continuously fetches page by page of dataset items until all of them are
 * loaded.
 *
 * If the dataset changes while this is in progress, or it is unselected,
 * polling is stopped.
 */
export const loadAllDatasetItems: DatasetAction<PollDatasetItemsParams, void> = (
  { commit, getters, state },
  { datasetId, filter }
) => {
  if (datasetId !== state.currentDataset.id) { return }

  let poller: Poller | undefined
  let page: PaginationParams = { size: 500 }

  commit('REGISTER_DATASET_ITEM_POLLER', datasetId)

  const poll = async () => {
    poller = state.itemsPollers.find(p => p.id === datasetId)

    // should not happen
    if (!poller) { return }

    // poller is uniquely identified by id (datasetId) and timestamp, so we
    // store timestamp to see if polling has restarted since last call
    const { timestamp } = poller

    // make a request
    const query = {
      ...(filter || (getters.datasetItemApiFilter as DatasetItemFilter)),
      datasetId,
      page
    }

    const response = await loadDatasetItems(query)

    // if response errored, return now and stop polling
    if ('error' in response) { return response }

    // if response is not a pagination response, throw an error
    if (!('items' in response.data) || !('metadata' in response.data)) {
      throw new Error('[dataset/loadAllDatasetItems]: Expected pagination response')
    }

    // if dataset changed, stop polling
    if (datasetId !== state.currentDataset.id) { return }

    poller = state.itemsPollers.find(p => p.id === datasetId)

    // check if poller was unregistered while request was being processed
    if (!poller) { return }

    // or if a different poller was registered under the same id
    if (timestamp !== poller.timestamp) { return }

    commit('ADD_DATASET_ITEMS', response.data.items)
    // as soon as we fetch the first page, we should consider the state to be
    // loaded
    commit('SET_DATASET_ITEMS_LOADED')

    // if there is no next cursor, we have just gotten the last page and polling
    // can stop
    const next = response.data.metadata.next
    if (!next) { return }

    // setup a recursive call to fetch next page
    page = { ...page, from: next }
    const timeoutHandle = setTimeout(() => poll(), poller.period)
    commit('SET_ITEM_POLLER_TIMEOUT_HANDLE', { id: datasetId, timeoutHandle })
  }

  poll()
}

export const stopLoadingAllDatasetItems: DatasetAction<PollDatasetItemsParams> = async (
  { commit },
  { datasetId }
// eslint-disable-next-line require-await
) => {
  commit('UNREGISTER_DATASET_ITEM_POLLER', datasetId)
}

export const restartLoadingAllDatasetItems: DatasetAction<PollDatasetItemsParams> = async (
  { commit, dispatch },
  { datasetId }
) => {
  // we set loading flag
  commit('SET_DATASET_ITEMS_LOADING')

  // stop any current polling and clear out the store of existing items
  await dispatch('stopLoadingAllDatasetItems', { datasetId })
  commit('SET_DATASET_ITEMS', [])

  // start new polling.
  // first succesfull poll request will unset loading flag
  await dispatch('loadAllDatasetItems', { datasetId })
}
