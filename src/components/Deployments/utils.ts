import moment from 'moment'

import {
  InferenceRequestCountPayload,
  RunningSessionInstanceCountPayload
} from '@/store/types'

import {
  AdaptedInstanceCountDataPoint,
  AdaptedModelRequestDataPoint,
  DeploymentDataRange
} from './types'

/**
 * Computes default lower bound for specified chart range
 *
 * - total -> null (no default bound)
 * - month -> start of day 1 month ago
 * - week -> start of day 1 week ago
 * - day -> start of hour 1 day ago
 */
export const buildFrom = (range: DeploymentDataRange): string | null => {
  if (range === 'total') { return null }

  const utcNow = moment.utc()

  let start: moment.Moment

  if (range === 'month') {
    start = utcNow.subtract(1, 'month').startOf('day')
  } else if (range === 'week') {
    start = utcNow.subtract(1, 'week').startOf('day')
  } else if (range === 'day') {
    start = utcNow.subtract(1, 'day').startOf('hour')
  } else {
    throw new Error('Invalid chart data range')
  }

  return start.format('YYYY-MM-DDTHH:mm:ss')
}

type UnadaptedModelRequestDataPoint =
  Pick<
    InferenceRequestCountPayload,
    'date' |
    'running_session_id' |
    'request_count' |
    'success_count' |
    'failure_count'
  >

export const adaptModelRequestReportData = (
  r: UnadaptedModelRequestDataPoint
): AdaptedModelRequestDataPoint => ({
  date: r.date,
  runningSessionId: r.running_session_id,
  allRequests: r.request_count,
  successfulRequests: r.success_count,
  failedRequests: r.failure_count
})

export const adaptInstanceCountReportData = (
  r: RunningSessionInstanceCountPayload
): AdaptedInstanceCountDataPoint => ({
  date: r.reported_for,
  runningSessionId: r.running_session_id,
  activeCount: r.available,
  inactiveCount: r.stopped + r.stopping
})
