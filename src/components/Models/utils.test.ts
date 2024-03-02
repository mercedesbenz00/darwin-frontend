import { buildMetricPayload } from 'test/unit/factories'

import { metricLatestValue, secondsToEtaString } from '@/components/Models/utils'

describe('metricLatestValue', () => {
  it('returns 0 if no data', () => {
    const metric = buildMetricPayload({ data: [] })
    expect(metricLatestValue(metric)).toEqual(0)
  })

  it('rounds metric to second decimal digit', () => {
    const metric = buildMetricPayload({ data: [{ x: 1, y: 1.9876 }, { x: 2, y: 2.7563 }] })
    expect(metricLatestValue(metric)).toEqual(2.76)
  })
})

describe('secondsToEtaString', () => {
  it('seconds only', () => {
    expect(secondsToEtaString(59)).toEqual('a few seconds')
  })

  it('a minute only', () => {
    expect(secondsToEtaString(60)).toEqual('1 minute')
  })

  it('minutes only', () => {
    expect(secondsToEtaString(59 * 60)).toEqual('59 minutes')
  })

  it('an hour only', () => {
    expect(secondsToEtaString(60 * 60)).toEqual('1 hour')
  })

  it('hours only', () => {
    expect(secondsToEtaString(3 * 60 * 60)).toEqual('3 hours')
  })

  it('minutes and hours', () => {
    expect(secondsToEtaString(3 * 60 * 60 + 54 * 60)).toEqual('3 hours and 54 minutes')
  })

  it('a day only', () => {
    expect(secondsToEtaString(24 * 60 * 60)).toEqual('1 day')
  })

  it('a day, hours and minutes', () => {
    expect(secondsToEtaString(24 * 60 * 60 + 3 * 60 * 60 + 54 * 60)).toEqual('1 day, 3 hours and 54 minutes')
  })

  it('multiples days, hours and minutes', () => {
    expect(secondsToEtaString(2 * 24 * 60 * 60 + 3 * 60 * 60 + 54 * 60)).toEqual('2 days, 3 hours and 54 minutes')
  })
})
