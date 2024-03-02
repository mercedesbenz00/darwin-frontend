import { formatCredit, formatSubCredit } from '@/utils'

it('formats one credit', () => {
  expect(formatCredit(1)).toEqual('1.00 credit')
})
it('formats less than one credits', () => {
  expect(formatCredit(0.3)).toEqual('0.30 credits')
})
it('formats plural credits', () => {
  expect(formatCredit(10)).toEqual('10.00 credits')
})

it('formats plural sub credits', () => {
  expect(formatSubCredit(1000)).toEqual('10.00 credits')
})
