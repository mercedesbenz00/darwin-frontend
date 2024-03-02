import { serializer } from '@/engine/plugins/boundingBox/serializer'

describe('deserialize', () => {
  it('works for normal raw data', () => {
    const data = { bounding_box: { x: 10, y: 20, w: 5, h: 6 } }
    expect(serializer.deserialize(data)).toEqual(
      expect.objectContaining({
        bottomLeft: expect.objectContaining({ x: 10, y: 26 }),
        bottomRight: expect.objectContaining({ x: 15, y: 26 }),
        topLeft: expect.objectContaining({ x: 10, y: 20 }),
        topRight: expect.objectContaining({ x: 15, y: 20 })
      })
    )
  })
})
