import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'
import { isErrorResponse, parseError, Socket } from '@/utils'

/**
 * In BILLING_V3, using the clicker and, in the future, other automation actions,
 * uses up annotation credits.
 *
 * By default, each first clicker call (bounding box, not clicks), uses 36
 * seconds of annotation time.
 *
 * This amount can be changed from the Admin UI on a per-team basis.
 *
 * This action simply reports an automation action being used to the
 * workview channel. It does not concern itself with the type of automation,
 * how many seconds it uses, or anything of the sort.
 */
const reportAutomationAction: WorkviewTrackerAction<void, void> =
  async ({ commit, dispatch, state }) => {
    const { topic } = state
    if (!topic) { commit('SET_PENDING_AUTOMATION_ACTION') }

    const { data: channel, error } = await dispatch('resolveChannel', state.topic)
    if (error) { return { error } }

    try {
      await Socket.pushPromise(channel, 'workview:automation_action', {})
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error)
    }

    commit('START_TIMER')
    commit('SET_TIMER', window.setInterval(() => commit('INCREMENT_TIMER'), 1000))
  }

export default reportAutomationAction
