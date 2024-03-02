import { polygonToRaster } from '@/utils'

describe('polygonToRaster', () => {
  it('when polygon is an empty array', () => {
    expect(polygonToRaster([], 0)).toEqual({
      data: [],
      coords: {
        minX: Infinity,
        maxX: -Infinity,
        minY: Infinity,
        maxY: -Infinity
      },
      boundingBox: {
        x: Infinity,
        y: Infinity,
        w: -Infinity,
        h: -Infinity
      }
    })
  })

  it('when square-shape polygon is provided', () => {
    expect(polygonToRaster(
      [ {x: 1, y: 1 }, 
        {x: 1, y: 3 },
        {x: 3, y: 3 },
        {x: 3, y: 1 }], 3)).toEqual({
      data: [4, 5, 7, 8],
      coords: {
        minX: 1,
        maxX: 3,
        minY: 1,
        maxY: 3
      },
      boundingBox: {
        x: 1,
        y: 1,
        w: 2,
        h: 2
      }
    })
  })

  it('when polygon is provided with float values', () => {
    expect(polygonToRaster(
      [ {x: 1.21343, y: 1.21343 }, 
        {x: 1.21343, y: 3.24211 },
        {x: 3.24211, y: 3.24211 },
        {x: 3.24211, y: 1.21343 }], 4)).toEqual({
      data: [9, 10],
      coords: {
        minX: 1,
        maxX: 3,
        minY: 2,
        maxY: 4
      },
      boundingBox: {
        x: 1,
        y: 2,
        w: 2,
        h: 2
      }
    })
  })

  it('when triangle-shape polygon is provided', () => {
    expect(polygonToRaster(
      [ {x: 1, y: 1 }, 
        {x: 1, y: 3 },
        {x: 3, y: 3 }], 3)).toEqual({
      data: [7],
      coords: {
        minX: 1,
        maxX: 3,
        minY: 1,
        maxY: 3
      },
      boundingBox: {
        x: 1,
        y: 1,
        w: 2,
        h: 2
      }
    })
  })
})
