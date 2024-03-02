import { ModelDevice } from '@/store/modules/neuralModel/types'
import { ModelTemplatePayload } from '@/store/types'
import { ModelType } from '@/utils/wind/types'

type Params = Partial<ModelTemplatePayload>

export const buildModelTemplatePayload = (params: Params = {}): ModelTemplatePayload => ({
  devices: [ModelDevice.CPU, ModelDevice.GPU],
  docker_image: 'fake-docker-image',
  id: 'fake-model-template-id',
  infer_params: {},
  load_params: {},
  name: 'Fake Template',
  train_params: {},
  type: ModelType.InstanceSegmentation,
  inserted_at: '2000-01-01T00:00:00Z',
  updated_at: '2000-01-02T00:00:00Z',
  ...params
})
