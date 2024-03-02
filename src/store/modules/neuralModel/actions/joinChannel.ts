import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { WindSocket as Socket, WindChannel as Channel, constructError } from '@/utils'
import {
  NewTrainedModel,
  RunningSessionStatusUpdated,
  TrainingSessionStatusUpdated
} from '@/utils/modelsChannel'

const resolve = async (topic: string) => {
  let result

  try {
    result = await Socket.connectAndJoin(topic) as { channel: Channel }
  } catch {
    result = { channel: null, error: { message: 'Models channel not available' } }
  }

  return { error: null, ...result }
}

type JoinChannel = NeuralModelAction<{ topic: string }, void>

/**
 * Performs initial join on the models channel, setting the topic and binding to events
 */
export const joinChannel: JoinChannel = async ({ commit }, { topic }) => {
  const { channel, error } = await resolve(topic)

  if (error) { return constructError('SOCKET_ERROR', error.message) }
  if (!channel) { throw new Error("Couldn't setup dataset channel") }

  channel.on('new_trained_model', (payload: NewTrainedModel) => {
    const { model: trainedModel } = payload
    commit('PUSH_TRAINED_MODEL', trainedModel)
  })

  channel.on('running_session_status_updated', (payload: RunningSessionStatusUpdated) => {
    const { model: runningSession } = payload
    commit('PUSH_RUNNING_SESSION', runningSession)
  })

  channel.on('training_session_status_updated', (payload: TrainingSessionStatusUpdated) => {
    const { model: trainingSession } = payload
    commit('PUSH_TRAINING_SESSION', trainingSession)
  })
}
