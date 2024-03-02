/**
 * Color related helper functions
 */
import ColorConverter from 'color-convert'
import ColorHash from 'color-hash'
import { isNumber } from 'lodash'

const colorHash = new ColorHash()

/**
 * An interface to capture red-green-blue-alpha values.
 */
export interface RGBA {
  /** red, between 0-255 */
  r: number;
  /** green, between 0-255 */
  g: number;
  /** blue, between 0-255 */
  b: number;
  /** alpha, between 0.0-1.0 */
  a: number;
}

/**
 * An interface to capture red-green-blue-alpha values.
 */
export interface HSLA {
  /** hue, between 0-359 */
  h: number;
  /** saturation, between 0-99 */
  s: number;
  /** lightness, between 0-99 */
  l: number;
  /** alpha, between 0.0-1.0 */
  a: number;
}

/**
 * Renders a RGBA value in a css compatible way.
 * @param rgba `RGBA` value to render
 * @param alpha if `alpha` is provided then it overrides the alpha value in the `rgba` argument
 */
export function rgbaString (rgba: RGBA, alpha: number | undefined = undefined): string {
  if (alpha === undefined) {
    return `rgba(${rgba.r},${rgba.g},${rgba.b},${rgba.a})`
  }
  return `rgba(${rgba.r},${rgba.g},${rgba.b},${alpha})`
}

export const getRGBAColorHash = (str: string): RGBA => {
  const rgbHash = colorHash.rgb(str)
  return { r: rgbHash[0], g: rgbHash[1], b: rgbHash[2], a: 1.0 }
}

export const getHSLAColorHash = (str: string): HSLA => {
  const hslHash = colorHash.hsl(str)
  return { h: hslHash[0], s: hslHash[1] * 100, l: hslHash[2] * 100, a: 1.0 }
}

export const getColorHash = (str: string, type: string = 'hex'): string | number[] => {
  if (type === 'rgba') { return rgbaString(getRGBAColorHash(str)) }
  if (type === 'rgb') { return colorHash.rgb(str) }
  if (type === 'hsl') { return colorHash.hsl(str) }
  return colorHash.hex(str)
}

/**
 * Parses a `rgba(r,g,b,a)` or `rgb(r,g,b)` string and if possible returns a RGBA element.
 * If the alpha value is not present, it is set to 1.0
 * @param rgba string to be parsed
 */
export function parseRGBA (rgba: string): RGBA {
  const rgbaColor = rgba.match(/rgba\(\s*(\d*),\s*(\d*),\s*(\d*),\s*(\d*(\.\d*)?)\)/)
  if (rgbaColor) {
    return {
      r: Number(rgbaColor![1]),
      g: Number(rgbaColor![2]),
      b: Number(rgbaColor![3]),
      a: Number(rgbaColor![4]) }
  }
  const rgbColor = rgba.match(/rgb\(\s*(\d*),\s*(\d*),\s*(\d*)\)/)
  if (rgbColor) {
    return { r: Number(rgbColor![1]), g: Number(rgbColor![2]), b: Number(rgbColor![3]), a: 1.0 }
  }
  throw new Error(`Invalid color string: ${rgba}`)
}

/**
 * Parses a `hsla(h,s,l,a)` or `hsl(h,s,l)` string and if possible returns a HSLA element.
 * If the alpha value is not present, it is set to 1.0
 * @param hsla string to be parsed
 */
export function parseHSLA (hsla: string): HSLA {
  const hslaColor = hsla.match(/hsla\(\s*(\d*),\s*(\d*)%,\s*(\d*)%,\s*(\d*(\.\d*)?)\)/)
  if (hslaColor) {
    return {
      h: Number(hslaColor![1]),
      s: Number(hslaColor![2]),
      l: Number(hslaColor![3]),
      a: Number(hslaColor![4]) }
  }
  const hslColor = hsla.match(/hsl\(\s*(\d*),\s*(\d*)%,\s*(\d*)%\)/)
  if (hslColor) {
    return { h: Number(hslColor![1]), s: Number(hslColor![2]), l: Number(hslColor![3]), a: 1.0 }
  }
  throw new Error('Invalid color string')
}

/**
 * Renders a HSLA value in a css compatible way.
 * @param hsla `HSLA` value to render
 * @param alpha if `alpha` is provided then it overrides the alpha value in the `hsla` argument
 */

export function hslaString (hsla: HSLA, alpha: number | undefined = undefined): string {
  if (!alpha) {
    return `hsla(${hsla.h},${hsla.s}%,${hsla.l}%,${hsla.a})`
  }
  return `hsla(${hsla.h},${hsla.s}%,${hsla.l}%,${alpha})`
}

/**
 * Convert RGBA into HSLA values
 * @param rgba rgba color value
 * @returns converted hsla object
 */
export const rgbaToHSLA = (rgba: RGBA): HSLA => {
  const hsl = ColorConverter.rgb.hsl([rgba.r, rgba.g, rgba.b])
  return {
    h: hsl[0],
    s: hsl[1],
    l: hsl[2],
    a: rgba.a
  }
}

/**
 * Convert HSLA into RGBA values
 * @param hsla hsla color value
 * @returns updated color string
 */
export const hslaToRGBA = (hsla: HSLA): RGBA => {
  const rgb = ColorConverter.hsl.rgb([hsla.h, hsla.s, hsla.l])
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
    a: hsla.a
  }
}

/**
 * Converts a HEX css string to a RGBA object
 *
 * Supports 3-digit or 6-digit hex strings
 *
 * @param {String} hex 3 or 6-digit hex string. Must start with '#'
 */
export const hexToRGBA = (hex: string): RGBA => {
  const rgb = ColorConverter.hex.rgb(hex)
  return {
    r: rgb[0],
    g: rgb[1],
    b: rgb[2],
    a: 1.0
  }
}

/**
 * Modify RGBA attributes
 * @param rgba rgba color value
 * @param modifier rgba partial value to modify
 * @returns updated color string
 */
export const modifyRGBA = (rgba: RGBA, modifier?: Partial<RGBA>): RGBA => {
  if (!modifier) { return rgba }
  return {
    r: isNumber(modifier.r) ? modifier.r : rgba.r,
    g: isNumber(modifier.g) ? modifier.g : rgba.g,
    b: isNumber(modifier.b) ? modifier.b : rgba.b,
    a: isNumber(modifier.a) ? modifier.a : rgba.a
  }
}

/**
 * Modify HSLA attributes
 * @param hsla hsla color value
 * @param modifier partial hsla attributes to modify
 * @returns updated color string
 */
export const modifyHSLA = (hsla: HSLA, modifier?: Partial<HSLA>): HSLA => {
  if (!modifier) { return hsla }
  return {
    h: modifier.h || hsla.h,
    s: modifier.s || hsla.s,
    l: modifier.l || hsla.l,
    a: modifier.a || hsla.a
  }
}

/**
 * Change the alpha value of the RGBA color
 * @param rgbaClr original color
 * @param alpha target alpha value to change
 * @returns Alpha value updated color
 */
export const changeRGBAAlpha = (rgbaClr: string, alpha: number): string => {
  const rgba = parseRGBA(rgbaClr)
  return rgbaString(rgba, alpha)
}

/**
 * Change the alpha value of the HSLA color
 * @param hslaClr original color
 * @param alpha target alpha value to change
 * @returns Alpha value updated color
 */
export const changeHSLAAlpha = (hslaClr: string, alpha: number): string => {
  const hsla = parseHSLA(hslaClr)
  return hslaString(hsla, alpha)
}

/**
 * Change the rgbaString to hsla string
 * @param rgbaString rgba string color
 * @param modifier HSLA modifier
 * @returns HSLA param modified string
 */
export const rgbaStringToHSLAString = (rgbaString: string, modifier?: Partial<HSLA>): string => {
  return hslaString(
    modifyHSLA(
      rgbaToHSLA(parseRGBA(rgbaString)),
      modifier
    )
  )
}

/**
 * Convert any color string into RGBA object
 * @param color color string - rgba, hsla, hex are accepted
 */
export const anyToRGBA = (color: string): RGBA => {
  if (color.startsWith('rgb')) { return parseRGBA(color) }
  if (color.startsWith('hsl')) { return hslaToRGBA(parseHSLA(color)) }
  if (color.startsWith('#')) { return hexToRGBA(color) }
  return { r: 0, g: 0, b: 0, a: 1 }
}

/**
 * Convert any color string into HSLA object
 * @param color color string - rgba, hsla, hex are accepted
 */
export const anyToHSLA = (color: string): HSLA => {
  if (color.startsWith('rgb')) { return rgbaToHSLA(parseRGBA(color)) }
  if (color.startsWith('hsl')) { return parseHSLA(color) }
  if (color.startsWith('#')) { return rgbaToHSLA(hexToRGBA(color)) }
  return { h: 0, s: 0, l: 0, a: 1 }
}

export const black: (a?: number) => RGBA = (a = 1.0) => ({ r: 0, g: 0, b: 0, a })
export const white: (a?: number) => RGBA = (a = 1.0) => ({ r: 255, g: 255, b: 255, a })
export const primary: (a?: number) => RGBA = (a = 1.0) => ({ r: 35, g: 88, b: 250, a })

/**
 * Measure the luminance of a RGBA
 */
export const getLuminanace = (rgba: RGBA): number => {
  const { r, g, b, a } = rgba
  return Number(((0.2126 * r + 0.7152 * g + 0.0722 * b) / a).toFixed(3))
}

/**
 * Measure the contrast ration between two RGBA colors
 */
export const getContrastRatio = (back: string, text: string): number => {
  const lumBack = getLuminanace(anyToRGBA(back))
  const lumText = getLuminanace(anyToRGBA(text))
  return (Math.max(lumBack, lumText) + 0.05) / (Math.min(lumBack, lumText) + 0.05)
}

/**
 * Return true if contrast ratio between two colors is too low
 */
export const isLowContrastRatio = (back: string, text: string): boolean => {
  return getContrastRatio(back, text) <= 1
}
