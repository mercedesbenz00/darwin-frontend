/** import { Dispatch } from 'vuex' */

import { WorkviewAction } from '@/store/modules/workview/types'
import { Socket, Channel, constructError } from '@/utils'
import { ItemsUpdated } from '@/utils/datasetChannel'

type JoinChannel = WorkviewAction<{ topic: string}, void>

const resolve = async (topic: string) => {
  let result

  try {
    result = await Socket.connectAndJoin(topic) as { channel: Channel }
  } catch {
    result = { channel: null, error: { message: 'Dataset channel not available' } }
  }

  return { error: null, ...result }
}

// const reloadStats = (dispatch: Dispatch) => {
//   dispatch('loadDatasetItemCountsThrottled')
//   dispatch('loadDatasetFoldersThrottled')
// }

/**
 * Performs initial join on the workview channel, setting the topic and binding to events
 */
export const joinChannel: JoinChannel = async ({ commit, /** dispatch, */state }, { topic }) => {
  const { channel, error } = await resolve(topic)
  if (error) { return constructError('SOCKET_ERROR', error.message) }
  if (!channel) { throw new Error("Couldn't setup dataset channel") }

  channel.on('items_updated', (payload: ItemsUpdated) => {
    const { dataset_items: items } = payload
    if (items.length === 0) { return }
    const { dataset } = state
    const item = items[0]
    if (!dataset || dataset.id !== item.dataset_id) { return }
    commit('UPDATE_DATASET_ITEMS', items)

    // NOTE: Disabled due to performance issues.
    // Can potentially be enabled once we resolve those
    // if (!state.dataset) { return }
    // reloadStats(dispatch)
  })
}
