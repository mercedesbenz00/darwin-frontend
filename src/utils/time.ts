/**
 * Time related conversion functions
 */
import moment from 'moment'

import { addZeros } from './formatter'

const DEFAULT_LOCALE = {
  future: 'in %s',
  past: '%s ago',
  s: 'a few seconds',
  ss: '%d seconds',
  m: 'a minute',
  mm: '%d minutes',
  h: 'an hour',
  hh: '%d hours',
  d: 'a day',
  dd: '%d days',
  M: 'a month',
  MM: '%d months',
  y: 'a year',
  yy: '%d years'
}

/**
 * Update locale settings
 */
export const updateLocale = (dict: {}): void => {
  moment.updateLocale('en', {
    relativeTime: { ...DEFAULT_LOCALE, ...dict }
  })
}

/**
 * Returns the earliest amont a list of moments
 */
export const earliest = (dates: moment.MomentInput[]): moment.Moment => {
  return moment.min(...dates.map((date) => moment.utc(date)))
}

/**
 * Formats a date as a 'time ago' string
 */
export const getAgoString = (date: moment.MomentInput): string => {
  return moment.utc(date).fromNow()
}

/**
 * Formats date as '{friendly amount of time} left'.
 */
export const getEtaString = (date: moment.MomentInput, offset: number = 0): string => {
  const timeout = moment.utc(date).add(offset)
  return `${moment.utc(moment.now()).to(timeout).replace('in ', '')} left`
}

/**
 * Formats a duration amount, specifed in seconds, into a HH:MM:SS string.
 *
 * The HH part of the string is discarded if duration is less than an hour.
 */
export const formatDurationAsTimer = (
  durationInSeconds: number,
  separator: string = ':'
): string => {
  const seconds = durationInSeconds % 60
  const minutes = Math.floor(durationInSeconds % 3600 / 60)
  const hours = Math.floor(durationInSeconds / 3600)
  return (hours ? [hours, minutes, seconds] : [minutes, seconds])
    .map((p) => addZeros(p, 2)).join(separator)
}

/**
 * Formats a duration amount, specified in seconds into a Xd Xh Xm string.
 *
 * The d and h parts are discarded if duration is less than a day, or an hour, respectively.
 */
export const formatDurationAsSpan = (
  durationInSeconds: number, maxUnit: 'd' | 'h' = 'd'
): string => {
  const duration = moment.duration(durationInSeconds, 'seconds')
  const parts = []

  if (maxUnit === 'd') {
    // duration.get('d') will not include months
    // duration.asDays() returns a float
    if (durationInSeconds >= 24 * 3600) { parts.push(`${Math.floor(duration.asDays())}d`) }
    if (durationInSeconds >= 3600) { parts.push(`${duration.get('h')}h`) }
  } else {
    if (durationInSeconds >= 3600) { parts.push(`${Math.floor(duration.asHours())}h`) }
  }

  parts.push(`${duration.get('m')}m`)

  return parts.join(' ')
}

/**
 * Formats a date string in ISO format, to the specified format
 */
export const formatDate = (value: string, format: string): string => {
  return moment(value).format(format)
}

/**
 * Formats a date in unix timestamp format to the specified format
 */
export const formatUnixDate = (value: number, format: string): string => {
  return moment.unix(value).format(format)
}

export const daysInCurrentMonth = (): number => moment.utc().daysInMonth()

export const dateFromUtcISO = (iso: string): Date => moment.utc(iso).toDate()

/**
 * Returns unix epoch as javascript Date
 */
export const dateUtcNow = (): Date => moment.utc().toDate()

/**
 * Returns unix epoch value, in seconds
 */
export const dateUtcNowSeconds = (): number => Math.floor(dateUtcNow().getTime() / 1000)

/**
 * Returns difference (in specified unit) between two javascript dates
 *
 * If the left date is greater than the right, the return will be a negative number
 */
export const dateDiff =
  (left: Date, right: Date, unit: moment.unitOfTime.Diff = 'days'): number => {
    return moment(left).diff(moment(right), unit, true)
  }

/**
 * Returns `Date` instance for start of day, with an optional offset
 *
 * @param offsetAmount Amount of units to offset, defaults to 0
 * @param offsetUnit Unit to offset with. Defaults to 'day'
 */
export const startOfDay = (offsetAmount?: number, offsetUnit?: moment.unitOfTime.Base): Date =>
  moment.utc().startOf('day').add(offsetAmount || 0, offsetUnit || 'day').toDate()

const DATE_INPUT_FORMAT = 'YYYY-MM-DD'

/** Convert raw date object to string, using specified format */
export const formatRawDate = (date: moment.MomentInput, format: string): string =>
  moment(date).format(format)

/**
 * Format an instance of `Date` to the format used by an `<input type="date">`
 */
export const formatForDateInput = (date: Date): string => moment(date).format(DATE_INPUT_FORMAT)

/**
 * Parses string used by an `<input type="date">` into a `Date` instance, into an ISO string
 */
export const formatFromDateInput = (value: string): string =>
  moment.utc(value, DATE_INPUT_FORMAT).toISOString()

/**
 * Returns current unix timestamp, in milliseconds
 */
export const unixNowMs = (): number => Date.now()

/**
 * Returns current unix timestamp, in seconds
 */
export const unixNowSeconds = (): number => Math.floor(unixNowMs() / 1000)

const dateFromUnixNowMs = (unixNowMs: number): Date => new Date(unixNowMs)

/**
 * Takes unix seconds timestamp and converts it to ISO string
 */
export const unixToIso = (unixNowMs: number): string => dateFromUnixNowMs(unixNowMs).toISOString()

export const unixSecondsFromIso = (iso: string): number =>
  Math.floor(dateFromUtcISO(iso).getTime() / 1000)

export const unixSeconds = (): number => Math.floor(new Date().getTime() / 1000)
