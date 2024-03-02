import { SegmentedControlVariant } from '@/components/Common/SegmentedControl/types'

export const variantValidator = (value: SegmentedControlVariant): boolean =>
  Object.values(SegmentedControlVariant).includes(value)
