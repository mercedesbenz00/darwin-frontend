import freeEmailDomains from 'free-email-domains'

/**
 * Creates an image with text written in the middle.
 *
 * @param text Text to be displayed
 * @param width width of image
 * @param height height of image
 */
export const generateImageWithCenteredText = (
  text: string,
  width: number,
  height: number
): string => {
  const canvas = document.createElement('canvas')
  canvas.width = 50
  canvas.height = 50
  const ctx = canvas.getContext('2d')
  if (!ctx) { throw new Error('Unable to generate image with text') }

  ctx.textAlign = 'center'
  ctx.font = '15px Arial'
  ctx.fillText(text, width / 2, height / 2)

  return canvas.toDataURL('image/png')
}

/**
 * Get clearbit logo url from company url
 * This will also
 * @param companyUrl Company url to load logo for
 * @param size Logo size (Optional)
 * @returns Clearbit logo url if company url is valid, else null
 */
export const getClearbitLogo = (
  companyUrl: string | null,
  size?: number
): string | null => {
  if (!companyUrl) { return null }
  if (freeEmailDomains.includes(companyUrl)) { return null }
  const baseUrl = `//logo.clearbit.com/${companyUrl}`
  if (size) {
    return baseUrl + `?size=${size}`
  }
  return baseUrl
}
