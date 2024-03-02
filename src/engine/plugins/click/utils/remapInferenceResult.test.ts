import { PointMapping } from '@/engine/plugins/click/types'

import { remapInferenceResult } from '.'

const mapping: PointMapping<'Image'> = {
  forward: (point) => point.mul(2),
  backward: (point) => point.div(2)
}

describe('remapInferenceResult', () => {
  it('returns data if it does not include any polygon, bounding_box or path field', () => {
    expect(remapInferenceResult({ text: { text: 'just text' } }, mapping)).toEqual({
      text: { text: 'just text' }
    })
  })

  it('maps path backwards', () => {
    const inferenceData = {
      path: [
        { x: 1, y: 1 },
        { x: 10, y: 1 },
        { x: 10, y: 10 }
      ]
    }
    expect(remapInferenceResult(inferenceData, mapping)).toEqual({
      path: [
        { x: 0.5, y: 0.5 },
        { x: 5, y: 0.5 },
        { x: 5, y: 5 }
      ]
    })
  })

  it('maps complex polygon backwards', () => {
    const inferenceData = {
      complex_polygon: [
        [
          { x: 1, y: 1 },
          { x: 10, y: 1 },
          { x: 10, y: 10 }
        ],
        [
          { x: 10, y: 10 },
          { x: 20, y: 10 },
          { x: 20, y: 20 }
        ]
      ]
    }
    expect(remapInferenceResult(inferenceData, mapping)).toEqual({
      complex_polygon: [
        [
          { x: 0.5, y: 0.5 },
          { x: 5, y: 0.5 },
          { x: 5, y: 5 }
        ],
        [
          { x: 5, y: 5 },
          { x: 10, y: 5 },
          { x: 10, y: 10 }
        ]
      ]
    })
  })

  it('maps bounding_box backwards', () => {
    const inferenceData = { bounding_box: { x: 1, y: 1, w: 10, h: 10 } }
    expect(remapInferenceResult(inferenceData, mapping)).toEqual({
      bounding_box: { x: 0.5, y: 0.5, w: 5, h: 5 }
    })
  })
})
