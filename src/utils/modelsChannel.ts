import {
  RunningSessionPayload,
  TrainedModelPayload,
  TrainingSessionPayload
} from './wind/types'

/**
 * Payload structure for the `new_trained_model` message received
 * through the models channel
 */
export type NewTrainedModel = {
  model: TrainedModelPayload
}

/**
 * Payload structure for the `running_session_status_updated` message received
 * through the models channel
 */
export type RunningSessionStatusUpdated = {
  model: RunningSessionPayload
}

/**
 * Payload structure for the `training_session_status_updated` message received
 * through the models channel
 */
export type TrainingSessionStatusUpdated = {
  model: TrainingSessionPayload
}
