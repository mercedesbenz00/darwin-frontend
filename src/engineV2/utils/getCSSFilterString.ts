import { ImageManipulationFilter } from '@/engineCommon/imageManipulation'

/**
 * Converts the filter values into CSS filter string
 * i.e. { contrast: 99, saturate: 25 } => 'contrast(99%) saturate(25%)'
 */
export const getCSSFilterString = (filter: ImageManipulationFilter): string => {
  const validKeys = ['contrast', 'saturate', 'brightness', 'isInverted']
  return Object.entries(filter)
    .filter(([key, value]) => value !== 100 && validKeys.includes(key))
    .map(([key, value]) =>
      key === 'isInverted'
        ? `invert(${value ? '99.9%' : '0%'})`
        : `${key}(${value}%)`)
    .join(' ')
}
