import { getBlockedFilesMessage } from './utils'

// tests getBlockedFilesMessage
describe('getBlockedFilesMessage', () => {
  it('should return a string with the correct message', () => {
    expect(getBlockedFilesMessage(['test.txt'])).toBe(
      'Ignoring already uploaded file: test.txt'
    )
  })
  it('should return a string with the correct message', () => {
    expect(getBlockedFilesMessage(['test.txt', 'test2.txt'])).toBe(
      'Ignoring already uploaded files: test.txt, test2.txt'
    )
  })
  it('should return a string with the correct message', () => {
    expect(getBlockedFilesMessage([
      'test.txt',
      'test2.txt',
      'test3.txt',
      'test4.txt',
      'test5.txt',
      'test6.txt',
      'test7.txt'
    ])).toBe(
      // eslint-disable-next-line max-len
      'Ignoring already uploaded files: test.txt, test2.txt, test3.txt, test4.txt, test5.txt and 2 more files'
    )
  })
})
