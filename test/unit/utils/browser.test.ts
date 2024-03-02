import { onMacOS } from '@/utils'

describe('onMacOS', () => {
  const platformGetter = () => jest.spyOn(window.navigator, 'platform', 'get')

  it('return true for MacOS', () => {
    const platformFunc = platformGetter()
    platformFunc.mockReturnValue('Macintosh')
    expect(onMacOS()).toBeTruthy()
    platformFunc.mockReturnValue('MacIntel')
    expect(onMacOS()).toBeTruthy()
    platformFunc.mockReturnValue('MacPPC')
    expect(onMacOS()).toBeTruthy()
    platformFunc.mockReturnValue('Mac68K')
    expect(onMacOS()).toBeTruthy()
  })

  it('return false for non-MacOS', () => {
    const platformFunc = platformGetter()
    platformFunc.mockReturnValue('Win32')
    expect(onMacOS()).toBeFalsy()
  })
})
