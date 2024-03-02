import {
  DialogSize
} from '@/components/Common/Modal/V2/types'

export const sizeValidator = (value: DialogSize): boolean =>
  [
    DialogSize.SMALL,
    DialogSize.MEDIUM,
    DialogSize.LARGE
  ].includes(value)
