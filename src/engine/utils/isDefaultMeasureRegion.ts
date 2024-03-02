import { MeasureRegionsPayload } from '@/store/types'

export const isDefaultMeasureRegion = (measureRegion: MeasureRegionsPayload) =>
  measureRegion.unit.x === 'px' &&
  measureRegion.unit.y === 'px' &&
  measureRegion.x === 0 &&
  measureRegion.y === 0
