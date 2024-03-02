import {
  addZeros,
  anonymize,
  getFullName,
  getReadableFileSizeString,
  getShortenedName
} from '@/utils'

describe('addZeros', () => {
  it('padds a number with zeros up to length of 4 by default', () => {
    expect(addZeros(0)).toEqual('0000')
    expect(addZeros(1)).toEqual('0001')
    expect(addZeros(25)).toEqual('0025')
    expect(addZeros(123)).toEqual('0123')
    expect(addZeros(4321)).toEqual('4321')
  })

  it('returns number as string if number of digits is more than default length', () => {
    expect(addZeros(54321)).toEqual('54321')
  })

  it('padds to specified number of digits', () => {
    expect(addZeros(1, 2)).toEqual('01')
    expect(addZeros(1, 3)).toEqual('001')
    expect(addZeros(1, 4)).toEqual('0001')
    expect(addZeros(1, 5)).toEqual('00001')
  })
})

describe('getShortenedName', () => {
  it('returns starting letters of words in string', () => {
    expect(getShortenedName('John')).toEqual('J')
    expect(getShortenedName('John Doe')).toEqual('JD')
  })

  it('converts result to uppercase', () => {
    expect(getShortenedName('john')).toEqual('J')
    expect(getShortenedName('john doe')).toEqual('JD')
  })

  it('works with more than 2 words, if specified', () => {
    expect(getShortenedName('lorem ipsum dolor sid amet', 3)).toEqual('LID')
    expect(getShortenedName('lorem ipsum dolor sid amet', 4)).toEqual('LIDS')
    expect(getShortenedName('lorem ipsum dolor sid amet', 5)).toEqual('LIDSA')
  })

  it('returns as many initials as possible, if requested more than available in term', () => {
    expect(getShortenedName('John', 2)).toEqual('J')
    expect(getShortenedName('John Doe', 3)).toEqual('JD')
  })
})

describe('getFullName', () => {
  it('joins first and last name', () => {
    expect(getFullName({ first_name: 'John', last_name: 'Doe' })).toEqual('John Doe')
  })

  it('trims individual name parts', () => {
    expect(getFullName({ first_name: 'John  ', last_name: 'Doe  ' })).toEqual('John Doe')
  })

  it('trims individual resuluting output', () => {
    expect(getFullName({ first_name: 'John', last_name: '' })).toEqual('John')
  })
})

describe('anonymize', () => {
  it('replaces all chars with *', () => {
    expect(anonymize('foo')).toEqual('***')
    expect(anonymize('char')).toEqual('****')
    expect(anonymize('longer')).toEqual('******')
  })

  it('keeps specified amount of leading characters', () => {
    expect(anonymize('longer', 1)).toEqual('l*****')
    expect(anonymize('longer', 2)).toEqual('lo****')
    expect(anonymize('longer', 3)).toEqual('lon***')
    expect(anonymize('longer', 4)).toEqual('long**')
    expect(anonymize('longer', 5)).toEqual('longe*')
    expect(anonymize('longer', 6)).toEqual('longer')
  })

  it('replaces all characters if amount to keep is greater than available', () => {
    expect(anonymize('longer', 7)).toEqual('longer')
  })
})

describe('getReadableFileSizeString', () => {
  it('returns 0.1 KB at minimum', () => {
    expect(getReadableFileSizeString(1)).toEqual('0.1 KB')
  })

  it('returns size in bytes, converted to closest unit', () => {
    expect(getReadableFileSizeString(205)).toEqual('0.2 KB')
    expect(getReadableFileSizeString(2048)).toEqual('2 KB')
    expect(getReadableFileSizeString(20480)).toEqual('20 KB')
    expect(getReadableFileSizeString(204800)).toEqual('200 KB')
    expect(getReadableFileSizeString(2 * 1024 * 1024)).toEqual('2 MB')
    expect(getReadableFileSizeString(20 * 1024 * 1024)).toEqual('20 MB')
    expect(getReadableFileSizeString(200 * 1024 * 1024)).toEqual('200 MB')
    expect(getReadableFileSizeString(2048 * 1024 * 1024)).toEqual('2 GB')
    expect(getReadableFileSizeString((2048 + 512) * 1024 * 1024 * 1024)).toEqual('2.5 TB')
  })

  it('returns size in bytes, converted to closest unit, when factor is 1000', () => {
    expect(getReadableFileSizeString(200, 1000)).toEqual('0.2 KB')
    expect(getReadableFileSizeString(2000, 1000)).toEqual('2 KB')
    expect(getReadableFileSizeString(20000, 1000)).toEqual('20 KB')
    expect(getReadableFileSizeString(200000, 1000)).toEqual('200 KB')
    expect(getReadableFileSizeString(2 * 1000 * 1000, 1000)).toEqual('2 MB')
    expect(getReadableFileSizeString(20 * 1000 * 1000, 1000)).toEqual('20 MB')
    expect(getReadableFileSizeString(200 * 1000 * 1000, 1000)).toEqual('200 MB')
    expect(getReadableFileSizeString(2000 * 1000 * 1000, 1000)).toEqual('2 GB')
    expect(getReadableFileSizeString(2650 * 1000 * 1000 * 1000, 1000)).toEqual('2.65 TB')
  })
})
