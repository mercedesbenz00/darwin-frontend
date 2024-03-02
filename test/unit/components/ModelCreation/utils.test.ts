import { getTrainingCounts } from '@/components/ModelCreation/utils'

describe('getTrainingCounts', () => {
  it('works as expected', () => {
    expect(getTrainingCounts(0)).toEqual({ training: 0, validation: 0, test: 0 })
    expect(getTrainingCounts(1)).toEqual({ training: 1, validation: 0, test: 0 })
    expect(getTrainingCounts(2)).toEqual({ training: 2, validation: 0, test: 0 })
    expect(getTrainingCounts(3)).toEqual({ training: 1, validation: 1, test: 1 })
    expect(getTrainingCounts(4)).toEqual({ training: 2, validation: 1, test: 1 })
    expect(getTrainingCounts(5)).toEqual({ training: 3, validation: 1, test: 1 })
    expect(getTrainingCounts(6)).toEqual({ training: 4, validation: 1, test: 1 })
    expect(getTrainingCounts(7)).toEqual({ training: 5, validation: 1, test: 1 })
    expect(getTrainingCounts(8)).toEqual({ training: 6, validation: 1, test: 1 })
    expect(getTrainingCounts(9)).toEqual({ training: 7, validation: 1, test: 1 })
    expect(getTrainingCounts(10)).toEqual({ training: 8, validation: 1, test: 1 })
    expect(getTrainingCounts(11)).toEqual({ training: 9, validation: 1, test: 1 })
    expect(getTrainingCounts(12)).toEqual({ training: 10, validation: 1, test: 1 })
    expect(getTrainingCounts(20)).toEqual({ training: 16, validation: 2, test: 2 })
    expect(getTrainingCounts(100)).toEqual({ training: 80, validation: 10, test: 10 })
  })
})
