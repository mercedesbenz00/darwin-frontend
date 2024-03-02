import { fillStyle } from '@/engine/graphics'
import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

describe('fillStyle', () => {
  describe('when filter is not provided', () => {
    it('returns an rgba string with alpha 0.1 when `inferred` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, true, false, false)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha 0.1 when `isHighlighed` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, false, true, false)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha 0.1 when `isSelected` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, false, false, true)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha 0.15 otherwise', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, null, false, false, false)).toEqual('rgba(12,34,56,0.15)')
    })
  })

  describe('when filter is provided', () => {
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

    it('returns an rgba string with alpha 0.1 when `inferred` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, filter, true, false, false)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha 0.1 when `isHighlighed` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, filter, false, true, false)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha 0.1 when `isSelected` is true', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, filter, false, false, true)).toEqual('rgba(12,34,56,0.1)')
    })

    it('returns an rgba string with alpha filter.opacity / 100 otherwise', () => {
      expect(fillStyle({ r: 12, g: 34, b: 56, a: 1.0 }, filter, false, false, false)).toEqual('rgba(12,34,56,0.6)')
    })
  })
})
