import { serializer } from '@/engine/plugins/table/serializer'

describe('serialize', () => {
  it('works for table data', () => {
    const data = {
      boundingBox: { x: 10, y: 10, w: 10, h: 10 },
      cells: []
    }
    expect(serializer.serialize(data)).toEqual({
      table: {
        bounding_box: { x: 10, y: 10, w: 10, h: 10 },
        cells: []
      }
    })
  })

  it('raises for non-table data', () => {
    const data = {}
    expect(() => { serializer.serialize(data) }).toThrow()
  })
})

describe('deserialize', () => {
  it('works for normal raw data', () => {
    const data = {
      table: {
        bounding_box: { x: 10, y: 10, w: 10, h: 10 },
        cells: []
      }
    }
    expect(serializer.deserialize(data)).toEqual(
      expect.objectContaining({
        boundingBox: { x: 10, y: 10, w: 10, h: 10 },
        cells: []
      })
    )
  })
})
