/**
 * Browser and System related functions
 */
export const onMacOS = (): boolean => {
  const platform = window.navigator.platform
  const macosPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K']
  if (macosPlatforms.indexOf(platform) !== -1) {
    return true
  }
  return false
}

export const isSafariBrowser = (): boolean =>
  navigator.userAgent.indexOf('Safari') > -1 && navigator.userAgent.indexOf('Chrome') <= -1
