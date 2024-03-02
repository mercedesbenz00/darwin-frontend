import { Dispatch } from 'vuex'

import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetPayload, StoreActionPayload } from '@/store/types'
import { Socket, Channel, constructError } from '@/utils'
import { ItemsDeleted, ItemsUpdated } from '@/utils/datasetChannel'

import { loadDatasetItemCountsThrottled } from './loadDatasetItemCountsThrottled'

const resolve = async (topic: string) => {
  let result

  try {
    result = await Socket.connectAndJoin(topic) as { channel: Channel }
  } catch {
    result = { channel: null, error: { message: 'Dataset channel not available' } }
  }

  return { error: null, ...result }
}

const reloadStats = (dispatch: Dispatch, dataset: DatasetPayload, foldersEnabled: boolean) => {
  const countsPayload: StoreActionPayload<typeof loadDatasetItemCountsThrottled> = { dataset }
  dispatch('loadDatasetItemCountsThrottled', countsPayload)
  if (foldersEnabled) { dispatch('loadDatasetFoldersThrottled', { datasetId: dataset.id }) }
}

type JoinChannel = DatasetAction<{ topic: string}, void>

/**
 * Performs initial join on the workview channel, setting the topic and binding to events
 */
export const joinChannel: JoinChannel = async ({ commit, dispatch, state }, { topic }) => {
  const { channel, error } = await resolve(topic)

  if (error) { return constructError('SOCKET_ERROR', error.message) }
  if (!channel) { throw new Error("Couldn't setup dataset channel") }

  channel.on('items_updated', (payload: ItemsUpdated) => {
    const { dataset_items: items } = payload
    if (items.length === 0) { return }
    const item = items[0]
    const currentDataset =
      state.datasets.find((d: DatasetPayload) => d.id === state.currentDataset.id)

    if (!currentDataset) { return }
    if (currentDataset.id !== item.dataset_id) { return }

    commit('PUSH_DATASET_ITEMS', items)

    reloadStats(dispatch, currentDataset, state.folderEnabled)
  })

  channel.on('items_deleted', ({ dataset_item_ids: ids }: ItemsDeleted) => {
    const currentDataset =
      state.datasets.find((d: DatasetPayload) => d.id === state.currentDataset.id)
    if (!currentDataset) { return }

    commit('REMOVE_DATASET_ITEMS_BY_IDS', ids)

    reloadStats(dispatch, currentDataset, state.folderEnabled)
  })
}
