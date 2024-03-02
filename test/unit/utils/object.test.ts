import { getPreviousFrameIndex } from '@/utils'

it('get previous index of key', () => {
  const frames = { 0: 'a', 3: 'b', 5: 'c', 9: 'd', 20: 'e' }
  expect(getPreviousFrameIndex(frames, 1)).toEqual(0)
  expect(getPreviousFrameIndex(frames, 4)).toEqual(3)
  expect(getPreviousFrameIndex(frames, 9)).toEqual(5)
  expect(getPreviousFrameIndex(frames, 100)).toEqual(20)
})
