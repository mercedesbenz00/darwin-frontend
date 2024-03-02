import { AutoAnnotateInferencePayload, isClickerData, parseInferenceData } from './backend'
import { Point } from './point'
import { Rectangle } from './rectangle'

describe('isClickerData', () => {
  let bbox: Rectangle<'Image'>

  beforeEach(() => {
    bbox = new Rectangle(
      new Point<'Image'>({ x: 0, y: 0 }),
      new Point<'Image'>({ x: 100, y: 100 })
    )
  })

  it('is falsy when data is AutoAnnotateInferencePayload', () => {
    const data: AutoAnnotateInferencePayload = { image: { base64: '' }, bbox }
    expect(isClickerData(data)).toBeFalsy()
  })

  it('is truthy when data is InferenceData', () => {
    const data = { image: { base64: '' }, data: { bbox, clicks: [] } }
    expect(isClickerData(data)).toBeTruthy()
  })
})

describe('parseInferenceData', () => {
  let bbox: Rectangle<'Image'>

  beforeEach(() => {
    bbox = new Rectangle(
      new Point<'Image'>({ x: 0, y: 0 }),
      new Point<'Image'>({ x: 100, y: 100 })
    )
  })

  it('when data is not clicker data', () => {
    const data: AutoAnnotateInferencePayload = { image: { base64: '' }, bbox }
    expect(parseInferenceData(data)).toEqual({
      image: { base64: '' },
      bbox: { x: 0, y: 0, w: 100, h: 100 }
    })
  })

  it('when data is clicker data', () => {
    const data = { image: { base64: '' }, data: { bbox, clicks: [] } }
    expect(parseInferenceData(data)).toEqual({
      image: { base64: '' },
      data: {
        bbox: { x: 0, y: 0, w: 100, h: 100 },
        clicks: []
      }
    })
  })
})
