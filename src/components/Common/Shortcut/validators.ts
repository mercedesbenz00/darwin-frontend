import { ShortcutSize } from './types'

export const sizeValidator = (value: ShortcutSize): boolean =>
  Object.values(ShortcutSize).includes(value)
