import {
  containSameKeys,
  initializeArray,
  updateArray
} from '@/utils'

it('renders a blank array of specified length', () => {
  expect(initializeArray(0)).toEqual([])
  expect(initializeArray(1)).toEqual([undefined])
  expect(initializeArray(3)).toEqual([undefined, undefined, undefined])
})

it('updates an object array with the new array', () => {
  const array1 = [{ id: 1, value: 1 }, { id: 2, value: 2 }]
  const array2 = [{ id: 1, value: 11 }, { id: 3, value: 3 }]
  updateArray(array1, array2, (entry) => entry.id)
  expect(array1).toEqual([{ id: 1, value: 11 }, { id: 3, value: 3 }])
})

describe('containSameKeys', () => {
  it('returns true if keys list are the same', () => {
    expect(containSameKeys({ a: 1, b: 1 }, { b: 1, a: 1 })).toBeTruthy()
  })
  it('returns true if keys list are not the same', () => {
    expect(containSameKeys({ a: 1, b: 1 }, { a: 1 })).toBeFalsy()
  })
})
