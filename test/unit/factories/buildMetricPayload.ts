import { MetricPayload } from '@/utils/wind/types'

type Params = Partial<MetricPayload>

export const buildMetricPayload = (params: Params = {}): MetricPayload => ({
  data: [
    { x: 1, y: 1 },
    { x: 2, y: 0.5 },
    { x: 3, y: 0.25 }
  ],
  name: 'train/loss',
  training_session_id: '',
  ...params
})
