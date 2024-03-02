import { KeycapSize } from './types'

export const sizeValidator = (value: KeycapSize): boolean =>
  Object.values(KeycapSize).includes(value)
