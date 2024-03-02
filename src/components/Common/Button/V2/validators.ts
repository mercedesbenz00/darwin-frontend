import {
  ButtonColor,
  ButtonFlair,
  IconButtonSize,
  CustomButtonSize,
  ButtonTag,
  ButtonVariant
} from '@/components/Common/Button/V2/types'

export const colorValidator = (value: ButtonColor): boolean =>
  Object.values(ButtonColor).includes(value)

export const variantValidator = (value: ButtonVariant): boolean =>
  Object.values(ButtonVariant).includes(value)

export const iconSizeValidator = (value: IconButtonSize): boolean =>
  Object.values(IconButtonSize).includes(value)

export const buttonSizeValidator = (value: CustomButtonSize): boolean =>
  Object.values(CustomButtonSize).includes(value)

export const flairValidator = (value: ButtonFlair): boolean =>
  Object.values(ButtonFlair).includes(value)

export const tagValidator = (value: ButtonTag): boolean =>
  Object.values(ButtonTag).includes(value)
