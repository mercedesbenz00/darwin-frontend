import { getClearbitLogo } from '@/utils/image'

describe('getClearbitLogo', () => {
  it('returns null if company url is null', () => {
    expect(getClearbitLogo(null)).toBeNull()
  })

  it('returns null if company url is blacklisted', () => {
    expect(getClearbitLogo('gmail.com')).toBeNull()
  })

  it('returns clearbit url when company url is valid', () => {
    const result = getClearbitLogo('v7labs.com')
    expect(result).toEqual('//logo.clearbit.com/v7labs.com')
  })

  it('returns clearbit url with size query when company url is valid', () => {
    const result = getClearbitLogo('v7labs.com', 80)
    expect(result).toEqual('//logo.clearbit.com/v7labs.com?size=80')
  })
})
