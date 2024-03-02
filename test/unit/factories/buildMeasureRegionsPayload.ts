import { MeasureRegionsPayload } from '@/store/types'

type MeasureRegionsBuildParams = Partial<MeasureRegionsPayload>

export const buildMeasureRegionsPayload = (params: MeasureRegionsBuildParams = {}): MeasureRegionsPayload => ({
  delta: { x: 1, y: 1 },
  high_priority: true,
  unit: { x: 'cm', y: 'cm' },
  w: 100,
  h: 100,
  x: 10,
  y: 10,
  ...params
})
