import { ModelPayload } from '@/store/modules/neuralModel/types'
import { ModelType } from '@/utils/wind/types'

type Params = Partial<ModelPayload>

export const buildModelPayload = (params: Params = {}): ModelPayload => ({
  dataset_id: -1,
  id: 'this-id-has-not-been-set',
  inserted_at: new Date().toISOString(),
  name: 'Object Detection Model',
  training: false,
  status: [],
  team_id: -1,
  tier: 'standard',
  type: ModelType.ObjectDetection,
  updated_at: new Date().toISOString(),
  url: 'http://external_wind_url',
  ...params
})
