import {
  parseRGBA,
  parseHSLA,
  changeRGBAAlpha,
  changeHSLAAlpha,
  rgbaString,
  hslaString,
  rgbaToHSLA,
  hslaToRGBA,
  rgbaStringToHSLAString,
  hexToRGBA,
  anyToRGBA,
  anyToHSLA,
  black,
  white,
  getLuminanace,
  getContrastRatio,
  isLowContrastRatio
} from '@/utils'

test('rgb_string -> parse idempotent ', () => {
  const rgb = { r: 1, g: 2, b: 3, a: 2 }
  expect(parseRGBA(rgbaString(rgb))).toEqual(rgb)
})

test('rgb_string <- parse idempotent ', () => {
  const rgb = 'rgba(1,2,3,2)'
  const parsed = parseRGBA(rgb)
  expect(parsed).toBeDefined()
  expect(rgbaString(parsed!)).toEqual(rgb)
})

test('hsl_string -> parse idempotent ', () => {
  const hsl = { h: 1, s: 2, l: 3, a: 2 }
  expect(parseHSLA(hslaString(hsl))).toEqual(hsl)
})

test('hsl_string <- parse idempotent ', () => {
  const hsl = 'hsla(1,2%,3%,2)'
  const parsed = parseHSLA(hsl)
  expect(parsed).toBeDefined()
  expect(hslaString(parsed!)).toEqual(hsl)
})

test('rgb_string handles alpha value', () => {
  expect(rgbaString({ r: 1, g: 2, b: 3, a: 2 })).toBe('rgba(1,2,3,2)')
})

test('rgb_string handles alpha value overwrite', () => {
  expect(rgbaString({ r: 1, g: 2, b: 3, a: 2 }, 10)).toBe('rgba(1,2,3,10)')
})

test('hsl_string handles alpha value', () => {
  expect(hslaString({ h: 1, s: 2, l: 3, a: 2 })).toBe('hsla(1,2%,3%,2)')
})

test('hsl_string handles alpha value overwrite', () => {
  expect(hslaString({ h: 1, s: 2, l: 3, a: 2 }, 10)).toBe('hsla(1,2%,3%,10)')
})

test('convert rgba to hsla', () => {
  expect(rgbaToHSLA({ r: 1, g: 2, b: 3, a: 1 })).toEqual({ h: 210, s: 50, l: 1, a: 1 })
})

test('convert hsla to rgba', () => {
  expect(hslaToRGBA({ h: 210, s: 50, l: 1, a: 1 })).toEqual({ r: 1, g: 3, b: 4, a: 1 })
})

test('change alpha value of rgba', () => {
  expect(changeRGBAAlpha('rgba(1, 2, 3, 0)', 1)).toBe('rgba(1,2,3,1)')
  expect(changeRGBAAlpha('rgb(1, 2, 3)', 1)).toBe('rgba(1,2,3,1)')
})

test('change alpha value of hsla', () => {
  expect(changeHSLAAlpha('hsla(1, 2%, 3%, 0)', 1)).toBe('hsla(1,2%,3%,1)')
  expect(changeHSLAAlpha('hsl(1, 2%, 3%)', 1)).toBe('hsla(1,2%,3%,1)')
})

test('convert rgbaString to hsla string with adjusted h/s/l values', () => {
  expect(rgbaStringToHSLAString('rgba(1, 2, 3, 1)')).toBe('hsla(210,50%,1%,1)')
})

describe('hexToRGBA', () => {
  it('converts 6-digit hex string to RGBA', () => {
    expect(hexToRGBA('#FFFFFF')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(hexToRGBA('#000000')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(hexToRGBA('#FF0000')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(hexToRGBA('#00FF00')).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(hexToRGBA('#0000FF')).toEqual({ r: 0, g: 0, b: 255, a: 1 })
  })

  it('converts 3-digit hex string to RGBA', () => {
    expect(hexToRGBA('#FFF')).toEqual({ r: 255, g: 255, b: 255, a: 1 })
    expect(hexToRGBA('#000')).toEqual({ r: 0, g: 0, b: 0, a: 1 })
    expect(hexToRGBA('#F00')).toEqual({ r: 255, g: 0, b: 0, a: 1 })
    expect(hexToRGBA('#0F0')).toEqual({ r: 0, g: 255, b: 0, a: 1 })
    expect(hexToRGBA('#00F')).toEqual({ r: 0, g: 0, b: 255, a: 1 })
  })
})

describe('anyToRGBA', () => {
  it('converts rgb string to rgba', () => {
    expect(anyToRGBA('rgb(50,99,149)')).toEqual({ r: 50, g: 99, b: 149, a: 1 })
  })
  it('converts rgba string to rgba', () => {
    expect(anyToRGBA('rgba(50,99,149,0.5)')).toEqual({ r: 50, g: 99, b: 149, a: 0.5 })
  })
  it('converts hsl string to rgba', () => {
    expect(anyToRGBA('hsl(210,50%,39%)')).toEqual({ r: 50, g: 99, b: 149, a: 1 })
  })
  it('converts hsla string to rgba', () => {
    expect(anyToRGBA('hsla(210,50%,39%,0.5)')).toEqual({ r: 50, g: 99, b: 149, a: 0.5 })
  })
  it('converts hex string to rgba', () => {
    expect(anyToRGBA('#326395')).toEqual({ r: 50, g: 99, b: 149, a: 1 })
  })
})

describe('anyToHSLA', () => {
  it('converts rgb string to hsla', () => {
    expect(anyToHSLA('rgb(50,99,149)')).toEqual({ h: 210, s: 50, l: 39, a: 1 })
  })
  it('converts rgba string to hsla', () => {
    expect(anyToHSLA('rgba(50,99,149,0.5)')).toEqual({ h: 210, s: 50, l: 39, a: 0.5 })
  })
  it('converts hsl string to hsla', () => {
    expect(anyToHSLA('hsl(210,50%,39%)')).toEqual({ h: 210, s: 50, l: 39, a: 1 })
  })
  it('converts hsla string to hsla', () => {
    expect(anyToHSLA('hsla(210,50%,39%,0.5)')).toEqual({ h: 210, s: 50, l: 39, a: 0.5 })
  })
  it('converts hex string to hsla', () => {
    expect(anyToHSLA('#326395')).toEqual({ h: 210, s: 50, l: 39, a: 1 })
  })
})

describe('black', () => {
  it('encodes the black color with correct alpha value', () => {
    expect(black(0.2)).toEqual({ r: 0, g: 0, b: 0, a: 0.2 })
    expect(black(0.5)).toEqual({ r: 0, g: 0, b: 0, a: 0.5 })
    expect(black(0.8)).toEqual({ r: 0, g: 0, b: 0, a: 0.8 })
  })
})

describe('white', () => {
  it('encodes the black color with correct alpha value', () => {
    expect(white(0.2)).toEqual({ r: 255, g: 255, b: 255, a: 0.2 })
    expect(white(0.5)).toEqual({ r: 255, g: 255, b: 255, a: 0.5 })
    expect(white(0.8)).toEqual({ r: 255, g: 255, b: 255, a: 0.8 })
  })
})

describe('getLuminanace', () => {
  it('return the correct luminance value', () => {
    expect(getLuminanace({ r: 50, g: 99, b: 149, a: 1 })).toEqual(92.193)
    expect(getLuminanace({ r: 50, g: 99, b: 149, a: 0.5 })).toEqual(184.385)
  })
})

describe('getContrastRatio', () => {
  it('return the contrast ratio between two rgba string colors', () => {
    expect(getContrastRatio('rgba( 120, 52, 48, 0.24)', 'rgba( 120, 52, 48, 1)')).toEqual(4.164275574617173)
    expect(getContrastRatio('rgba( 0, 0, 0, 0.24)', 'rgba( 0, 0, 0, 0.08)')).toEqual(1)
  })
})

describe('isLowContrastRatio', () => {
  it('return if the contrast ratio between two rgba string colors is too low', () => {
    expect(isLowContrastRatio('rgba( 50, 99, 149, 1)', 'rgba( 50, 99, 149, 0.24)')).toEqual(false)
    expect(isLowContrastRatio('rgba( 0, 0, 0, 0.24)', 'rgba( 0, 0, 0, 0.08)')).toEqual(true)
  })
})
