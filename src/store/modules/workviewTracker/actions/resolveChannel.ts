import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'
import { Socket, Channel, constructError } from '@/utils'

const resolve = async (topic: string) => {
  let result

  try {
    result = await Socket.connectAndJoin(topic) as { channel: Channel }
  } catch {
    return { channel: null, error: { message: 'Work tracking not available' } }
  }

  return { ...result, error: null }
}
/**
 * Idempotently resolves the correct channel for the specified topic
 *
 * Updates join status and topic in state if they have changed
 */
const resolveChannel: WorkviewTrackerAction<string, Channel | null> =
  async ({ commit, state }, topic) => {
    const { channel, error } = await resolve(topic)

    if (error) {
      commit('SET_STATUS', 'error')
      return constructError('SOCKET_ERROR', error.message)
    }

    if (state.status !== 'joined') { commit('SET_STATUS', 'joined') }
    return { data: channel }
  }

export default resolveChannel
