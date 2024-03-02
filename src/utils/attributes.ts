import { getHSLAColorHash, hslaToRGBA, rgbaString } from './color'

export const getAttributeColor = (label: string): string => {
  const hsla = getHSLAColorHash(label)
  hsla.l = 70
  return rgbaString(hslaToRGBA(hsla))
}
