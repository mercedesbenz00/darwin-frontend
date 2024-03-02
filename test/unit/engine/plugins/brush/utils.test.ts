import { createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'

import {
  buildBrushTip,
  buildRegularPolygonPath,
  buildSquarePath,
  fromPolyBool,
  getSides,
  isTipToBeRebuilt,
  toPolyBool,
  translatePath
} from '@/engine/plugins/brush/utils'
import { EditablePoint, Point } from '@/engineCommon/point'

const localVue = createLocalVue()
localVue.use(Vuex)

it('buildRegularPolygonPath builds a regular polygon with specified number of sides and given radius', () => {
  const path = buildRegularPolygonPath(10, 12)

  expect(path).toEqual([
    [10, 0],
    [8.66, 5],
    [5, 8.66],
    [0, 10],
    [-5, 8.66],
    [-8.66, 5],
    [-10, 0],
    [-8.66, -5],
    [-5, -8.66],
    [0, -10],
    [5, -8.66],
    [8.66, -5]
  ])
})

it('buildSquarePath builds a square centered at (0, 0), with sides aligned to x and y axes', () => {
  const path = buildSquarePath(10)

  expect(path).toEqual([
    [7.07, 7.07],
    [-7.07, 7.07],
    [-7.07, -7.07],
    [7.07, -7.07]
  ])
})

it('isTipToBeRebuilt returns true when the regular polygon is not a good circle proxy, false otherwise', () => {
  expect(isTipToBeRebuilt(100, 12)).toBeTruthy()
  expect(isTipToBeRebuilt(100, 30)).toBeFalsy()
})

it('translatePath translates the given path by the given point', () => {
  const path = buildRegularPolygonPath(10, 12)
  const point = new Point<'Image'>({ x: 5, y: 5 })
  const translated = translatePath(point, path)

  expect(translated).toEqual([
    [15, 5],
    [13.66, 10],
    [10, 13.66],
    [5, 15],
    [0, 13.66],
    [-3.66, 10],
    [-5, 5],
    [-3.66, 0],
    [0, -3.66],
    [5, -5],
    [10, -3.66],
    [13.66, 0]
  ])
})

it('buildBrushTip builds a Segment object with regions corresponding to the given path, translated by the given point', () => {
  const path = buildRegularPolygonPath(10, 12)
  const point = new Point<'Image'>({ x: 5, y: 5 })
  const brushTip = buildBrushTip(point, path)

  expect(brushTip.inverted).toBeFalsy()
  expect(brushTip.regions).toEqual([[
    [15, 5],
    [13.66, 10],
    [10, 13.66],
    [5, 15],
    [0, 13.66],
    [-3.66, 10],
    [-5, 5],
    [-3.66, 0],
    [0, -3.66],
    [5, -5],
    [10, -3.66],
    [13.66, 0]
  ]])
})

it('getSides returns 4 if the specified tip shape is squared, otherwise the minimum number of sides to approximate a circle, starting from 12', () => {
  expect(getSides('squared', 10)).toEqual(4)
  expect(getSides('squared', 1000)).toEqual(4)

  expect(getSides('round', 10)).toEqual(12)
  expect(getSides('round', 1000)).toEqual(48)
})

describe('fromPolyBool', () => {
  it('converts a polygon to a CompoundPath', () => {
    const polygon = {
      regions: [
        [[0, 0], [10, 0], [10, 10], [0, 10]],
        [[0, 0], [5, 0], [5, 5], [0, 5]]
      ],
      inverted: false
    }
    const compoundPath = fromPolyBool(polygon)

    const path = [
      new EditablePoint<'Image'>({ x: 0, y: 0 }),
      new EditablePoint<'Image'>({ x: 10, y: 0 }),
      new EditablePoint<'Image'>({ x: 10, y: 10 }),
      new EditablePoint<'Image'>({ x: 0, y: 10 })
    ]

    const additionalPaths = [[
      new EditablePoint<'Image'>({ x: 0, y: 0 }),
      new EditablePoint<'Image'>({ x: 5, y: 0 }),
      new EditablePoint<'Image'>({ x: 5, y: 5 }),
      new EditablePoint<'Image'>({ x: 0, y: 5 })
    ]]

    expect(compoundPath.path).toEqual(path)
    expect(compoundPath.additionalPaths).toEqual(additionalPaths)
  })

  it('filters out regions made of less than 3 points', () => {
    const polygon = {
      regions: [
        [[0, 0], [10, 0]],
        [[0, 0], [5, 0], [5, 5], [0, 5]]
      ],
      inverted: false
    }
    const compoundPath = fromPolyBool(polygon)

    const path = [
      new EditablePoint<'Image'>({ x: 0, y: 0 }),
      new EditablePoint<'Image'>({ x: 5, y: 0 }),
      new EditablePoint<'Image'>({ x: 5, y: 5 }),
      new EditablePoint<'Image'>({ x: 0, y: 5 })
    ]

    expect(compoundPath.path).toEqual(path)
    expect(compoundPath.additionalPaths).toEqual([])
  })
})

it('toPolyBool converts a CompoundPath to a polygon', () => {
  const path = [[0, 0], [10, 0], [10, 10], [0, 10]].map(([x, y]) => new EditablePoint<'Image'>({ x, y }))
  const additionalPaths = [[[0, 0], [5, 0], [5, 5], [0, 5]].map(([x, y]) => new EditablePoint<'Image'>({ x, y }))]
  const polygon = toPolyBool({ path, additionalPaths })

  const expectedPolygon = {
    regions: [
      [[0, 0], [10, 0], [10, 10], [0, 10]],
      [[0, 0], [5, 0], [5, 5], [0, 5]]
    ],
    inverted: false
  }

  expect(polygon).toEqual(expectedPolygon)
})
