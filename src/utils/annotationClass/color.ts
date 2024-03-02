import { encodeString } from '@/utils'
import { hslaToRGBA, modifyHSLA, parseRGBA, rgbaToHSLA, rgbaString } from '@/utils/color'

export const annotationClassColors = [
  'rgba(255,0,0,1.0)',
  'rgba(255,46,0,1.0)',
  'rgba(255,92,0,1.0)',
  'rgba(255,153,0,1.0)',
  'rgba(255,199,0,1.0)',
  'rgba(255,245,0,1.0)',
  'rgba(219,255,0,1.0)',
  'rgba(173,255,0,1.0)',
  'rgba(143,255,0,1.0)',
  'rgba(82,255,0,1.0)',
  'rgba(0,236,123,1.0)',
  'rgba(0,239,196,1.0)',
  'rgba(0,255,239,1.0)',
  'rgba(0,194,255,1.0)',
  'rgba(0,133,255,1.0)',
  'rgba(0,102,255,1.0)',
  'rgba(5,0,255,1.0)',
  'rgba(97,0,255,1.0)',
  'rgba(143,0,255,1.0)',
  'rgba(219,0,255,1.0)',
  'rgba(255,0,214,1.0)',
  'rgba(255,0,122,1.0)'
]

/**
 * Color variant lightness array for generate color palettes
 */
export const COLOR_VARIANT_LIGHTNESSES = [66, 75]

/**
 * Convert the original rgba string color to rgba color string after adding more lightness
 * @param color rgba color string
 * @param lightness lightness to apply to the color
 */
export const getAnnotationClassColorRGBAString = (color: string, lightness?: number): string => {
  if (!lightness) { return color }
  const colorHSLA = rgbaToHSLA(parseRGBA(color))
  return rgbaString(hslaToRGBA(modifyHSLA(colorHSLA, { l: lightness })))
}

/**
 * Generate the annotation class color from the value if it is set as auto\
 * and a value is passed, otherwise it's randomly picked
 */
export const getAutoAnnotationClassColor = (value?: string): string => {
  // calculate consistently the color base on a string (color picked will always be the same)
  if (value) {
    const encodedIndex = encodeString(value) % annotationClassColors.length

    return annotationClassColors[encodedIndex]
  }
  // fallback to random color
  const randomIdx = Math.floor(Math.random() * annotationClassColors.length)
  return annotationClassColors[randomIdx] || 'auto'
}
