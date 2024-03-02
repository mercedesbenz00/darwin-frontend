import { validatePassword, validateBusinessDomain } from '@/utils'

describe('validatePassword', () => {
  it('when password is empty', () => {
    expect(validatePassword('')).toContain('Please type in a password')
  })

  it('when password does not contain lowercase', () => {
    expect(validatePassword('ABC')).toContain('At least one lowercase letter')
  })

  it('when password does not contain uppercase', () => {
    expect(validatePassword('abc')).toContain('At least one uppercase letter')
  })

  it('when password does not contain digit', () => {
    expect(validatePassword('abcABC')).toContain('At least one digit')
  })

  it('when password length < 8', () => {
    expect(validatePassword('abcABC1')).toEqual(['At least 8 characters'])
  })

  it('when password is validated', () => {
    expect(validatePassword('abcABC123')).toEqual([])
  })
})

describe('validateBusinessDomain', () => {
  it('when domain is empty', () => {
    expect(validateBusinessDomain('')).toEqual(['Please input correct domain format'])
  })

  it('when domain is not correct domain format', () => {
    expect(validateBusinessDomain('abc')).toEqual(['Please input correct domain format'])
  })

  it('when domain is not business domain format', () => {
    expect(validateBusinessDomain('@gmail.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@google.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@yahoo.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@outlook.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@hotmail.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@msn.com')).toEqual(['Please input business domain'])
    expect(validateBusinessDomain('@qq.com')).toEqual(['Please input business domain'])
  })

  it('when domain is business domain format', () => {
    expect(validateBusinessDomain('@abc.com')).toEqual([])
  })
})
