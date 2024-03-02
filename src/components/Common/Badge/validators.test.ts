import {
  badgeSizeValidator,
  badgeTagValidator
} from './validators'

import {
  BadgeSize,
  BadgeTag
} from '.'

it('badgeSizeValidator should return true if a correct size is passed', () => {
  expect(badgeSizeValidator(BadgeSize.SMALL)).toBe(true)
})

it('badgeSizeValidator should return false if a wrong size is passed', () => {
  expect(badgeSizeValidator('foo' as BadgeSize)).toBe(false)
})

it('vadgeTagValidator should return true if a correct tag is passed', () => {
  expect(badgeTagValidator(BadgeTag.BUTTON)).toBe(true)
})

it('vadgeTagValidator should return false if a wrong tag is passed', () => {
  expect(badgeTagValidator('foo' as BadgeTag)).toBe(false)
})
