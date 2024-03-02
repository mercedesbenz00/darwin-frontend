import { ProgressBarVariant } from '@/components/Common/ProgressBar/types'

export const variantValidator = (value: ProgressBarVariant) =>
  [ProgressBarVariant.INACTIVE, ProgressBarVariant.ACTIVE].includes(value)

export const valueValidator = (value: number) => value >= 0 && value <= 1
