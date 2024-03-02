import { DatasetAction } from '@/store/modules/dataset/types'
import { Socket } from '@/utils'

type LeaveChannel = DatasetAction<{ topic: string }, void>

/**
 * Leaves currently connected-to channel
 */
export const leaveChannel: LeaveChannel = (context, { topic }) => {
  if (!topic) { return }
  Socket.leave(topic)
}
