import { SliderVariant } from './types'

export const variantValidator = (value: SliderVariant): boolean =>
  Object.values(SliderVariant).includes(value)
