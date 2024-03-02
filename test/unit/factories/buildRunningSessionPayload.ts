import { ModelDevice } from '@/store/modules/neuralModel/types'
import { RunningSessionPayload } from '@/store/types'

type Params = Partial<RunningSessionPayload>

export const buildRunningSessionPayload = (params: Params = {}): RunningSessionPayload => ({
  access_level: 'private',
  auto_start: false,
  auto_stop: false,
  device: ModelDevice.CPU,
  id: 'foo',
  inserted_at: '2000-01-01T00:00:00Z',
  max: 1,
  meta: {
    classes: [],
    num_instances_available: 0,
    num_instances_starting: 0
  },
  min: 1,
  name: 'a model',
  public: false,
  team_id: 1,
  trained_model_id: 'trained-model',
  updated_at: '2000-01-01T00:00:00Z',
  ...params
})
