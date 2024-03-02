import {
  findClosingBracketIndex,
  getCompanyUrlFromEmail
} from '@/utils/string'

describe('findClosingBracketIndex', () => {
  it('returns closing bracket index', () => {
    const text = '[bracket[second[third]]]'
    const endIndex = findClosingBracketIndex(text, 0)
    expect(endIndex).toEqual(text.length - 1)
  })

  it('returns -1 if no closing bracket found', () => {
    const text = '[bracket[second[third]]'
    const endIndex = findClosingBracketIndex(text, 0)
    expect(endIndex).toEqual(-1)
  })

  it('throws error when the first char is not bracket', () => {
    const text = '[bracket[second[third]]]'
    try {
      findClosingBracketIndex(text, 1)
    } catch (error: unknown) {
      expect(error).toBeDefined()
    }
  })
})

describe('getCompanyUrlFromEmail', () => {
  it('returns company url from email', () => {
    expect(getCompanyUrlFromEmail('test@v7labs.com')).toEqual('v7labs.com')
  })

  it('return null if email is not valid', () => {
    expect(getCompanyUrlFromEmail('test')).toBeNull()
  })
})
