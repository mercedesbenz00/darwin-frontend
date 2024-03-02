import { strokeStyle } from '@/engine/graphics'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

describe('strokeStyle', () => {
  describe('when filter is not provided', () => {
    it('returns an rgba string with alpha 1 when `inferred` is true', () => {
      expect(strokeStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, true, false)).toEqual('rgba(12,34,56,1)')
    })

    it('returns an rgba string with alpha 1 when `isSelected` is true', () => {
      expect(strokeStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, false, true)).toEqual('rgba(12,34,56,1)')
    })

    it('returns an rgba string with alpha 0.5 otherwise', () => {
      expect(strokeStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, false, false)).toEqual('rgba(12,34,56,0.5)')
    })
  })

  it('returns an rgba string with alpha filter.borderOpacity / 100.0 when filter is provided', () => {
    const filter: ImageManipulationFilter = {
      opacity: 60,
      contrast: 2,
      saturate: 3,
      borderOpacity: 40,
      brightness: 100,
      isImageSmoothing: false,
      isInverted: false,
      windowLevels: [0, 20000],
      colorMap: 'default'
    }

    expect(strokeStyle({ r: 12, g: 34, b: 56, a: 1.0 }, filter, false, false)).toEqual('rgba(12,34,56,0.4)')
  })
})
