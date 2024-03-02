import { WorkviewTrackerAction } from '@/store/modules/workviewTracker/types'
import { Socket } from '@/utils'

/**
 * Leaves currently connected-to channel
 */
const leaveChannel: WorkviewTrackerAction<void, void> = ({ commit, state }) => {
  if (!state.topic) { return }
  Socket.leave(state.topic)
  commit('RESET_ALL')
}

export default leaveChannel
