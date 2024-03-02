import { estimateTrainingHours, instanceCost, requestsPerSecond } from '@/utils'

it('estimateTrainingHours works as expected', () => {
  expect(estimateTrainingHours(0)).toEqual(1)
  expect(estimateTrainingHours(999)).toEqual(1.999)
  expect(estimateTrainingHours(1000)).toEqual(2)
  expect(estimateTrainingHours(1001)).toEqual(2.001)
})

it('instanceCost works as expected', () => {
  expect(instanceCost(3)).toEqual('0.10 credits')
})

it('requestsPerSecond works as expected', () => {
  expect(requestsPerSecond(3)).toEqual(30)
})
