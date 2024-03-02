import { getCSSFilterString } from '@/engine/utils'

describe('getCSSFilterString', () => {
  it('should transform object to the valid CSS filter string', () => {
    expect(getCSSFilterString({
      opacity: 15,
      borderOpacity: 80,
      contrast: 88,
      saturate: 89,
      brightness: 90,
      isInverted: true,
      isImageSmoothing: false,
      windowLevels: [1, 256],
      colorMap: 'hot'
    })).toBe('contrast(88%) saturate(89%) brightness(90%) invert(99.9%)')
  })

  it('should not include filter function with value 100', () => {
    expect(getCSSFilterString({
      opacity: 15,
      borderOpacity: 80,
      contrast: 88,
      saturate: 100,
      brightness: 90,
      isInverted: false,
      isImageSmoothing: false,
      windowLevels: [1, 256],
      colorMap: 'hot'
    })).toBe('contrast(88%) brightness(90%) invert(0%)')
  })
})
