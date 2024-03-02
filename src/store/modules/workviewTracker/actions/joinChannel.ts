import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'

/**
 * Performs initial join on the workview channel, setting the topic and binding to events
 */
const joinChannel: WorkviewTrackerAction<{ topic: string }, void> =
  async ({ commit, dispatch, state }, { topic }) => {
    if (state.topic !== topic) { commit('SET_TOPIC', topic) }

    const { data: channel, error } = await dispatch('resolveChannel', topic)
    if (error) { return { error } }

    channel.on('workview:time', (params: { time: number }) => commit('SET_TIME', params.time))

    if (state.pendingAutomationAction) { await dispatch('reportAutomationAction') }

    return channel
  }

export default joinChannel
