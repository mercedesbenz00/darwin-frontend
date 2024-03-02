import { advanceTo } from 'jest-date-mock'

import {
  formatDate,
  formatDurationAsSpan,
  formatDurationAsTimer,
  formatUnixDate,
  getAgoString,
  getEtaString,
  dateFromUtcISO,
  dateUtcNow,
  formatFromDateInput,
  formatForDateInput,
  startOfDay
} from '@/utils'

describe('getAgoString', () => {
  it('correctly computes a "time ago" string based on provided timestamp', () => {
    const date = new Date()
    const nowUnix = date.getTime()
    expect(getAgoString(date.toISOString())).toEqual('a few seconds ago')
    date.setTime(nowUnix - 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('a minute ago')

    date.setTime(nowUnix - 2 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('2 minutes ago')

    date.setTime(nowUnix - 3 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('3 minutes ago')

    date.setTime(nowUnix - 15 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('15 minutes ago')

    date.setTime(nowUnix - 60 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('an hour ago')

    date.setTime(nowUnix - 3 * 60 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('3 hours ago')

    date.setTime(nowUnix - 24 * 60 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('a day ago')

    date.setTime(nowUnix - 5 * 24 * 60 * 60 * 1000)
    expect(getAgoString(date.toISOString())).toEqual('5 days ago')
  })
})

describe('getEtaString', () => {
  it('correctly computes when offset is fixed and time moves towards it', () => {
    const date = new Date()
    const nowUnix = date.getTime()
    const offset = 1000 * 60 * 60 * 24 * 3 // 3 days (milliseconds)

    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 2 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 3 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 15 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 60 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 3 * 60 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('3 days left')

    date.setTime(nowUnix - 24 * 60 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('2 days left')

    date.setTime(nowUnix - 2 * 24 * 60 * 60 * 1000)
    expect(getEtaString(date.toISOString(), offset)).toEqual('a day left')
  })

  it('correctly computes when time is fixed and offset moves', () => {
    const date = (new Date()).toISOString()
    const minute = 1000 * 60
    const hour = minute * 60
    const day = hour * 24

    expect(getEtaString(date, hour)).toEqual('an hour left')
    expect(getEtaString(date, 2 * hour)).toEqual('2 hours left')
    expect(getEtaString(date, day)).toEqual('a day left')
    expect(getEtaString(date, 2 * day)).toEqual('2 days left')
    expect(getEtaString(date, 3 * day)).toEqual('3 days left')
  })
})

describe('formatDurationAsTimer', () => {
  it('formats amounts less than an hour correctly', () => {
    expect(formatDurationAsTimer(0)).toEqual('00:00')
    expect(formatDurationAsTimer(1)).toEqual('00:01')
    expect(formatDurationAsTimer(10)).toEqual('00:10')
    expect(formatDurationAsTimer(59)).toEqual('00:59')
    expect(formatDurationAsTimer(60)).toEqual('01:00')
    expect(formatDurationAsTimer(3599)).toEqual('59:59')
  })

  it('formats amounts moren than an hour correctly', () => {
    expect(formatDurationAsTimer(3600)).toEqual('01:00:00')
    expect(formatDurationAsTimer(99 * 3600 + 3599)).toEqual('99:59:59')
    expect(formatDurationAsTimer(150 * 3600)).toEqual('150:00:00')
  })
})

describe('formatDurationAsSpan', () => {
  it('formats amounts less than an hour correctly', () => {
    expect(formatDurationAsSpan(0)).toEqual('0m')
    expect(formatDurationAsSpan(1)).toEqual('0m')
    expect(formatDurationAsSpan(10)).toEqual('0m')
    expect(formatDurationAsSpan(59)).toEqual('0m')
    expect(formatDurationAsSpan(60)).toEqual('1m')
    expect(formatDurationAsSpan(3599)).toEqual('59m')
  })

  it('formats amounts more than an hour correctly', () => {
    expect(formatDurationAsSpan(3600)).toEqual('1h 0m')
    expect(formatDurationAsSpan(23 * 3600 + 3599)).toEqual('23h 59m')
  })

  it('formats amounts more than a day correctly', () => {
    expect(formatDurationAsSpan(24 * 3600 + 1)).toEqual('1d 0h 0m')
    expect(formatDurationAsSpan(47 * 3600 + 3599)).toEqual('1d 23h 59m')
  })

  it('formats amounts more than a month correctly', () => {
    expect(formatDurationAsSpan(35 * 24 * 3600)).toEqual('35d 0h 0m')
    expect(formatDurationAsSpan(35 * 24 * 3600 + 3 * 3600 + 30 * 60)).toEqual('35d 3h 30m')
  })

  it('formats amounts more than a day correctly when max unit is hour', () => {
    expect(formatDurationAsSpan(24 * 3600 + 1, 'h')).toEqual('24h 0m')
    expect(formatDurationAsSpan(47 * 3600 + 3599, 'h')).toEqual('47h 59m')
  })

  it('formats amounts more than a month correctly when max unit is hour', () => {
    expect(formatDurationAsSpan(35 * 24 * 3600, 'h')).toEqual('840h 0m')
    expect(formatDurationAsSpan(35 * 24 * 3600 + 3 * 3600 + 30 * 60, 'h')).toEqual('843h 30m')
  })
})

describe('formatDate', () => {
  it('formats as expected when format is DD/MM/YY', () => {
    expect(formatDate('2000-01-01T00:00:00', 'DD/MM/YY')).toEqual('01/01/00')
    expect(formatDate('2019-05-01T11:11:11', 'DD/MM/YY')).toEqual('01/05/19')
  })

  it('formats as expected when format is YYYY-MM-DD', () => {
    expect(formatDate('2000-01-01T00:00:00', 'YYYY-MM-DD')).toEqual('2000-01-01')
    expect(formatDate('2019-05-01T11:11:11', 'YYYY-MM-DD')).toEqual('2019-05-01')
  })

  it('formats as expected when format is "ll"', () => {
    expect(formatDate('2000-01-01T00:00:00', 'll')).toEqual('Jan 1, 2000')
    expect(formatDate('2019-05-01T11:11:11', 'll')).toEqual('May 1, 2019')
  })
})

describe('formatUnixDate', () => {
  it('formats as expected when format is "MMMM Do, YYYY"', () => {
    expect(formatUnixDate(1569630000, 'MMMM Do, YYYY')).toEqual('September 28th, 2019')
    expect(formatUnixDate(1569570000, 'MMMM Do, YYYY')).toEqual('September 27th, 2019')
    expect(formatUnixDate(1569530000, 'MMMM Do, YYYY')).toEqual('September 26th, 2019')
  })
})

describe('dateFromUtcISO', () => {
  it('parses iso string as UTC', () => {
    // we rely on the fact that parsed ISO string should equal formatted ISO string
    expect(dateFromUtcISO('2000-01-01T00:00:00').toISOString()).toEqual('2000-01-01T00:00:00.000Z')
    expect(dateFromUtcISO('2010-05-05T22:00:00').toISOString()).toEqual('2010-05-05T22:00:00.000Z')
  })
})

describe('dateUtcNow', () => {
  it('returns current date as if in UTC timezone', () => {
    advanceTo('2010-01-01T00:00:00.000Z')
    expect(dateUtcNow().toISOString()).toEqual('2010-01-01T00:00:00.000Z')
    advanceTo('2010-10-01T22:00:00.000Z')
    expect(dateUtcNow().toISOString()).toEqual('2010-10-01T22:00:00.000Z')
    advanceTo('2020-12-31T23:00:00.000Z')
    expect(dateUtcNow().toISOString()).toEqual('2020-12-31T23:00:00.000Z')
  })
})

describe('start of day', () => {
  advanceTo('2010-01-01T00:00:00.000Z')
  expect(startOfDay().toISOString()).toEqual('2010-01-01T00:00:00.000Z')
  expect(startOfDay(1).toISOString()).toEqual('2010-01-02T00:00:00.000Z')
  expect(startOfDay(1, 'day').toISOString()).toEqual('2010-01-02T00:00:00.000Z')
  expect(startOfDay(1, 'month').toISOString()).toEqual('2010-02-01T00:00:00.000Z')
})

describe('formatFromDateInput', () => {
  it('formats correctly', () => {
    expect(formatFromDateInput('2000-01-01')).toEqual('2000-01-01T00:00:00.000Z')
    expect(formatFromDateInput('2010-12-31')).toEqual('2010-12-31T00:00:00.000Z')
  })
})

describe('formatForDateInput', () => {
  it('formats correctly', () => {
    let date = dateFromUtcISO('2000-01-01T00:00:00.000Z')
    expect(formatForDateInput(date)).toEqual('2000-01-01')

    date = dateFromUtcISO('2010-12-31T00:00:00.000Z')
    expect(formatForDateInput(date)).toEqual('2010-12-31')
  })
})
