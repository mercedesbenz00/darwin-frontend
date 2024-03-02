import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'
import { isErrorResponse, parseError, Socket } from '@/utils'

const pause: WorkviewTrackerAction<void, void> =
  async ({ commit, dispatch, state }) => {
    const { topic } = state
    if (!topic) { return }

    const { data: channel, error } = await dispatch('resolveChannel', state.topic)
    if (error) { return { error } }

    try {
      await Socket.pushPromise(channel, 'workview:unpause', {})
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }

    commit('UNPAUSE_TIMER')
    if (state.timerStatus !== 'started') { return }
    commit('SET_TIMER', window.setInterval(() => commit('INCREMENT_TIMER'), 1000))
  }

export default pause
