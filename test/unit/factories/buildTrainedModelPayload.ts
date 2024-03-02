import { TrainedModelPayload } from '@/store/types'

import { buildModelTemplatePayload } from './buildModelTemplatePayload'

type Params = Partial<TrainedModelPayload>

export const buildTrainedModelPayload = (params: Params = {}): TrainedModelPayload => {
  const modelTemplate = buildModelTemplatePayload(params.model_template)
  delete params.model_template

  return {
    classes: [],
    id: 'foo',
    inserted_at: '2000-01-01T00:00:00Z',
    model_template: modelTemplate,
    name: 'a model',
    team_id: 1,
    training_result: { segm: { AP: 0.02 } },
    weights_key: 'abc',
    ...params
  }
}
