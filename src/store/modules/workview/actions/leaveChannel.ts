import { WorkviewAction } from '@/store/modules/workview/types'
import { Socket } from '@/utils'

type LeaveChannel = WorkviewAction<{ topic: string }, void>
/**
 * Leaves currently connected-to channel
 */
export const leaveChannel: LeaveChannel = (context, { topic }) => {
  if (!topic) { return }
  Socket.leave(topic)
}
