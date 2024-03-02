import { TrainingClass } from '@/store/types'

type Params = Partial<TrainingClass>

export const buildTrainingClass = (params: Params = {}): TrainingClass => ({
  id: 'box-id',
  subs: [],
  name: 'box',
  type: 'bounding_box',
  ...params
})
