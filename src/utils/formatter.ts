/**
 * String related helper functions
 * Just generate the strings that meet specific requirements
 */
import { words } from 'lodash'

export const addZeros = (num: number, length: number = 4): string => {
  return `${num}`.padStart(length, '0')
}

export const getReadableFileSize = (
  fileSizeInBytes: number,
  factor: 1000 | 1024 = 1024
): [string, string] => {
  let i = -1
  let size = fileSizeInBytes
  const byteUnits = ['KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  do {
    size = size / factor
    i++
  } while (size >= factor)

  const amount = parseFloat(Math.max(size, 0.1).toFixed(3))

  return [amount.toString(), byteUnits[i]]
}

/**
 * From the specified file size in bytes, computes and returns a formatted
 * string containing the file size with the most closely matched unit.
 *
 * The second argument specifies if the next unit is 1000 times larger than
 * the previous, or 1024
 *  */
export const getReadableFileSizeString = (
  fileSizeInBytes: number,
  factor: 1000 | 1024 = 1024
): string => {
  const [amount, unit] = getReadableFileSize(fileSizeInBytes, factor)
  return `${amount} ${unit}`
}

export const getShortenedName = (name: string, length: number = 2): string => {
  return words(name)
    .map(word => word[0])
    .slice(0, length)
    .join('')
    .toUpperCase()
}

// eslint-disable-next-line camelcase
type FullNameType = { first_name?: string, last_name?: string }

/**
 * Return formatted full name for a data object containing `first_name` and `last_name` properties
 *
 * The output is trimmed, but on individual name parts as well as the final result.
 */
export const getFullName =
  ({ first_name: firstName, last_name: lastName }: FullNameType): string =>
    [(firstName || '').trim(), (lastName || '').trim()].join(' ').trim()

/**
 * Formats a numeric value into a shortened representation
 *
 * - numbers less than 999 are rounded to 2 decimals
 * - numbers > 10 000 are rounded to k units, 1 decimal, ex: 1.5k, 10.2k, etc
 * - numbers > 100 000 are rounded to k units, 0 decimals, ex: 101k
 */
export const formatNumericValue = (value: number): string => {
  if (value >= 100000) { return `${(value / 1000.0).toFixed(0)}k` }
  if (value >= 10000) { return `${(value / 1000.0).toFixed(1)}k` }
  if (Math.floor(value) === value) { return value.toFixed(0) }
  return `${value.toFixed(2)}`
}

/**
 * Formats a numeric value into a shortened representation
 *
 * - numbers less than 999 are shown as is
 * - numbers > 1000 are rounded to k units, 1 decimal, ex: 1.5k, 10.2k, etc
 * - numbers > 10 000 are rounded to k units, 0 decimals, ex: 11k
 */
export const formatNumericValueTersly = (value: number): string => {
  if (value >= 10000) { return `${(value / 1000.0).toFixed(0)}k` }
  if (value >= 1000) { return `${(value / 1000.0).toFixed(1)}k` }
  if (Math.floor(value) === value) { return value.toFixed(0) }
  return `${value}`
}

/**
 * Formats a numeric value into a more readable representation
 *
 * e.g.: 123456789 -> '123 456 789'
 */
export const formatLongNumericString = (value: string): string => {
  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/**
 * Formats a number indicating a percentage (0-100 range) into a percentage string
 *
 * The string is rounded to 1 decimals by default,
 * but this can be changed by passing in a second argument.
 */
export const formatPercentageValue = (value: number, decimal: number = 1): string =>
  `${value.toFixed(decimal)}%`

/**
 * Anonymize a string by replacing all characters
 * except the specified amount of leading characters with *
 */
export const anonymize = (value: string, leadingCharsToKeep: number = 0): string =>
  `${value.slice(0, leadingCharsToKeep)}${value.slice(leadingCharsToKeep).replace(/./g, '*')}`
