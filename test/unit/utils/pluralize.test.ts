import { pluralize } from '@/utils'

it('formats plurals correctly', () => {
  expect(pluralize(0, 'Word', 'Words')).toEqual('0 Words')
  expect(pluralize(1, 'Word', 'Words')).toEqual('1 Word')
  expect(pluralize(2, 'Word', 'Words')).toEqual('2 Words')
})
