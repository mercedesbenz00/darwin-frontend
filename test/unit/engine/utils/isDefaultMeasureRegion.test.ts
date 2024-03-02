import { buildMeasureRegionsPayload } from 'test/unit/factories'

import { isDefaultMeasureRegion } from '@/engine/utils/isDefaultMeasureRegion'

describe('isDefaultMeasureRegion', () => {
  it('returns false if it is not default measure region payload', () => {
    const measureRegion = buildMeasureRegionsPayload()
    expect(isDefaultMeasureRegion(measureRegion)).toBeFalsy()
  })
  it('returns false if it is not default measure region payload', () => {
    const measureRegion = buildMeasureRegionsPayload({
      unit: { x: 'px', y: 'px' },
      x: 0,
      y: 0
    })
    expect(isDefaultMeasureRegion(measureRegion)).toBeTruthy()
  })
})
