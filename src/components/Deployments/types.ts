import { RunningSessionPayload } from '@/store/types'

export type DeploymentDataRange = 'total' | 'month' | 'week' | 'day'
export type DeploymentDataGranularity = 'day' | 'hour' | 'minute'

export type ModelRequestDimension = 'allRequests' | 'successfulRequests' | 'failedRequests'
export type InstanceCountDimension = 'activeCount' | 'inactiveCount'

export type AdaptedModelRequestDataPoint =
  {[k in ModelRequestDimension]: number} &
  { runningSessionId: string | null, date: string }

export type AdaptedInstanceCountDataPoint =
  {[k in InstanceCountDimension]: number} &
  { runningSessionId: string | null, date: string }

export type DeploymentData<T> = {
  runningSession: RunningSessionPayload
  data: T[]
}

export type AggregateData<T> = {
  data: T[]
}

export type DeploymentChartData<T> = {
  runningSession?: RunningSessionPayload
  data: T[]
}
