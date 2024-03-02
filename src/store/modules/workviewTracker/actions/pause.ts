import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'
import { isErrorResponse, parseError, Socket } from '@/utils'

const pause: WorkviewTrackerAction<void, void> =
  async ({ commit, dispatch, state }) => {
    const { topic } = state
    if (!topic) { return }

    const { data: channel, error } = await dispatch('resolveChannel', state.topic)
    if (error) { return { error } }

    try {
      await Socket.pushPromise(channel, 'workview:pause', {})
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }

    commit('PAUSE_TIMER')
  }

export default pause
