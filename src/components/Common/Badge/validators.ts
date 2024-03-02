import { BadgeSize, BadgeTag } from './types'

export const badgeSizeValidator = (value: BadgeSize): boolean =>
  Object.values(BadgeSize).includes(value)

export const badgeTagValidator = (value: BadgeTag): boolean =>
  Object.values(BadgeTag).includes(value)
