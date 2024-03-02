import { RangeWithId, sortRangeVertically } from '@/utils/videoAnnotation'

describe('sortRangeVertically', () => {
  it('sort range vertically', () => {
    const ranges: RangeWithId[] = [
      { id: '1', range: [0, 20] },
      { id: '2', range: [10, 20] },
      { id: '3', range: [15, 25] },
      { id: '4', range: [30, 50] }
    ]

    const { total, verticalIndexMap } = sortRangeVertically(ranges)
    expect(total).toEqual(3)
    expect(verticalIndexMap).toEqual({
      1: 0,
      2: 1,
      3: 2,
      4: 0
    })
  })

  it('sort range vertically with priority', () => {
    const ranges: RangeWithId[] = [
      { id: '1', range: [0, 20] },
      { id: '2', range: [10, 20] },
      { id: '3', range: [15, 25], priority: 1 },
      { id: '4', range: [30, 50] }
    ]

    const { total, verticalIndexMap } = sortRangeVertically(ranges)
    expect(total).toEqual(3)
    expect(verticalIndexMap).toEqual({
      1: 1,
      2: 2,
      3: 0,
      4: 0
    })
  })
})
