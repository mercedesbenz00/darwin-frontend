import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { WindSocket as Socket } from '@/utils'

type LeaveChannel = NeuralModelAction<{ topic: string }, void>

/**
 * Leaves currently connected-to channel
 */
export const leaveChannel: LeaveChannel = (context, { topic }) => {
  if (!topic) { return }
  Socket.leave(topic)
}
