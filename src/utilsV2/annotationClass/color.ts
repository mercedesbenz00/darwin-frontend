import { encodeString } from '@/utils'

type RainbowColor = {
  name: string,
  saturated: string
  normal: string
  desaturated: string
}

// colors from:
// https://www.figma.com/file/UoTh3HOfBaImaXNfPtfPyP/%F0%9F%8E%A8-V7-Design-System?node-id=4%3A597
export const rainbowColors: RainbowColor[] = [
  {
    name: '1',
    saturated: 'rgba(238,240,241,1.0)',
    normal: 'rgba(255,73,73,1.0)',
    desaturated: 'rgba(255,229,229,1.0)'
  },
  {
    name: '2',
    saturated: 'rgba(255,46,0,1.0)',
    normal: 'rgba(255,106,73,1.0)',
    desaturated: 'rgba(255,234,229,1.0)'
  },
  {
    name: '3',
    saturated: 'rgba(255,92,0,1.0)',
    normal: 'rgba(255,128,73,1.0)',
    desaturated: 'rgba(255,237,229,1.0)'
  },
  {
    name: '4',
    saturated: 'rgba(255,153,0,1.0)',
    normal: 'rgba(255,182,73,1.0)',
    desaturated: 'rgba(255,245,229,1.0)'
  },
  {
    name: '5',
    saturated: 'rgba(255,199,0,1.0)',
    normal: 'rgba(255,215,73,1.0)',
    desaturated: 'rgba(255,249,229,1.0)'
  },
  {
    name: '6',
    saturated: 'rgba(255,245,0,1.0)',
    normal: 'rgba(255,237,73,1.0)',
    desaturated: 'rgba(255,252,229,1.0)'
  },
  {
    name: '7',
    saturated: 'rgba(219,255,0,1.0)',
    normal: 'rgba(219,255,73,1.0)',
    desaturated: 'rgba(250,255,229,1.0)'
  },
  {
    name: '8',
    saturated: 'rgba(173,255,0,1.0)',
    normal: 'rgba(186,255,73,1.0)',
    desaturated: 'rgba(245,255,229,1.0)'
  },
  {
    name: '9',
    saturated: 'rgba(143,255,0,1.0)',
    normal: 'rgba(175,255,73,1.0)',
    desaturated: 'rgba(244,255,229,1.0)'
  },
  {
    name: '10',
    saturated: 'rgba(82,255,0,1.0)',
    normal: 'rgba(153,255,73,1.0)',
    desaturated: 'rgba(241,255,229,1.0)'
  },
  {
    name: '11',
    saturated: 'rgba(0,236,123,1.0)',
    normal: 'rgba(82,255,130,1.0)',
    desaturated: 'rgba(229,255,237,1.0)'
  },
  {
    name: '12',
    saturated: 'rgba(0,239,196,1.0)',
    normal: 'rgba(82,255,203,1.0)',
    desaturated: 'rgba(229,255,247,1.0)'
  },
  {
    name: '13',
    saturated: 'rgba(0,225,239,1.0)',
    normal: 'rgba(82,245,255,1.0)',
    desaturated: 'rgba(229,254,255,1.0)'
  },
  {
    name: '14',
    saturated: 'rgba(0,194,255,1.0)',
    normal: 'rgba(82,203,255,1.0)',
    desaturated: 'rgba(229,247,255,1.0)'
  },
  {
    name: '15',
    saturated: 'rgba(0,133,255,1.0)',
    normal: 'rgba(82,151,255,1.0)',
    desaturated: 'rgba(229,240,255,1.0)'
  },
  {
    name: '16',
    saturated: 'rgba(0,102,255,1.0)',
    normal: 'rgba(82,130,255,1.0)',
    desaturated: 'rgba(229,237,255,1.0)'
  },
  {
    name: '17',
    saturated: 'rgba(5,0,255,1.0)',
    normal: 'rgba(82,89,255,1.0)',
    desaturated: 'rgba(229,231,255,1.0)'
  },
  {
    name: '18',
    saturated: 'rgba(97,0,255,1.0)',
    normal: 'rgba(116,82,255,1.0)',
    desaturated: 'rgba(235,229,255,1.0)'
  },
  {
    name: '19',
    saturated: 'rgba(143,0,255,1.0)',
    normal: 'rgba(179,82,255,1.0)',
    desaturated: 'rgba(244,229,255,1.0)'
  },
  {
    name: '20',
    saturated: 'rgba(219,0,255,1.0)',
    normal: 'rgba(231,82,255,1.0)',
    desaturated: 'rgba(251,229,255,1.0)'
  },
  {
    name: '21',
    saturated: 'rgba(255,0,214,1.0)',
    normal: 'rgba(255,82,207,1.0)',
    desaturated: 'rgba(255,229,248,1.0)'
  },
  {
    name: '22',
    saturated: 'rgba(255,0,122,1.0)',
    normal: 'rgba(255,82,155,1.0)',
    desaturated: 'rgba(255,229,240,1.0)'
  },
]

// aggregated like that to keep each color saturated and normal
// version nearby
// export const annotationClassColors = rainbowColors
//   .reduce((acc, { normal, saturated }) => [...acc, saturated, normal], [] as string[])

export const saturatedClassColors = rainbowColors
  .reduce((acc, { saturated }) => [...acc, saturated], [] as string[])

export const normalClassColors = rainbowColors
  .reduce((acc, { normal }) => [...acc, normal], [] as string[])

export const desaturatedClassColors = rainbowColors
  .reduce((acc, { desaturated }) => [...acc, desaturated], [] as string[])

export const annotationClassColors = normalClassColors

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
