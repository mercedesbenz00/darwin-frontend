import { v4 as uuidv4 } from 'uuid'

import { ModelDevice } from '@/store/modules/neuralModel/types'
import { TrainingSessionPayload } from '@/store/types'

import { buildModelTemplatePayload } from './buildModelTemplatePayload'

type Params = Partial<TrainingSessionPayload>

export const buildTrainingSessionPayload = (params: Params = {}): TrainingSessionPayload => {
  const modelTemplate = buildModelTemplatePayload(params.model_template)

  return {
    dataset_id: 1,
    dataset_identifier: 'v7/sfh',
    dataset_version: 1,
    device: ModelDevice.CPU,
    gust: {
      current_running_session_id: null,
      id: uuidv4(),
      mode: 'train',
      status: 'available'
    },
    id: 'foo',
    inserted_at: '2000-01-01T00:00:00Z',
    model_template: modelTemplate,
    name: 'A training session with unset name',
    status: 'pending',
    team_id: 1,
    trained_model_id: null,
    training_stats: null,
    training_time_secs: 0,
    ...params
  }
}
