import { round } from 'lodash'

import { ModelStatus } from '@/store/modules/neuralModel/types'
import {
  MetricPayload,
  RunningSessionPayload,
  TrainedModelPayload,
  TrainingSessionPayload
} from '@/store/types'
import { pluralize } from '@/utils'

import { ModelItem } from './types'

export const isRunningSession = (
  m: RunningSessionPayload | TrainedModelPayload
): m is RunningSessionPayload => 'trained_model_id' in m

export const metricLatestValue = (metric: MetricPayload) => {
  const { data } = metric
  return data.length > 0 ? round(data[data.length - 1].y, 2) : 0
}

export const secondsToEtaString = (seconds: number) => {
  // Since this method involves parsing an ISO string and extracting HH and MM values,
  // We need to compute days separately
  const daySeconds = 24 * 60 * 60
  const days = Math.trunc(seconds / daySeconds)
  const remainderSeconds = seconds % daySeconds

  // Extracting HH:MM values
  const eta = new Date(remainderSeconds * 1000).toISOString().substr(11, 5)
  const [h, m] = eta.split(':').map(s => parseInt(s))

  // If no days, hours and minutes, just return a generic string
  if (!days && !h && !m) { return 'a few seconds' }

  // Build string, considering pluralization
  const daySeparator = h || m ? ', ' : ''
  let etaString = days > 0 ? `${pluralize(days, 'day', 'days')}${daySeparator}` : ''
  if (h) { etaString = `${etaString}${pluralize(h, 'hour', 'hours')}` }
  if (m) { etaString = `${etaString}${h ? ' and ' : ''}${pluralize(m, 'minute', 'minutes')}` }
  return etaString
}

type CompareFunction = (
  a: ModelItem,
  b: ModelItem,
  wrapper: (model: ModelItem) => any,
  modifier: 1 | -1
) => number

export const assignTrainedModelDatasetSlug = (
  modelItem: ModelItem & { trainedModel: TrainedModelPayload },
  trainingSessions: TrainingSessionPayload[]
): ModelItem => {
  const trainingSession =
    trainingSessions.find(s => s.trained_model_id === modelItem.trainedModel.id)
  if (!trainingSession) { return modelItem }

  const datasetIdentifier = trainingSession.dataset_identifier
  return { ...modelItem, datasetSlug: datasetIdentifier.split('/')[1] }
}

export const assignRunningSessionDatasetSlug = (
  modelItem: ModelItem & { runningSession: RunningSessionPayload },
  trainingSessions: TrainingSessionPayload[]
): ModelItem => {
  const trainingSession =
    trainingSessions.find(s => s.trained_model_id === modelItem.runningSession.trained_model_id)
  if (!trainingSession) { return modelItem }

  const datasetIdentifier = trainingSession.dataset_identifier
  return { ...modelItem, datasetSlug: datasetIdentifier.split('/')[1] }
}

export const convertTrainedModel = (
  r: TrainedModelPayload
): ModelItem & { trainedModel: TrainedModelPayload } => ({
  datasetSlug: null,
  id: r.id,
  insertedAt: r.inserted_at,
  name: r.name,
  teamId: r.team_id,
  trainedModel: r
})

export const convertTrainingSession =
  (r: TrainingSessionPayload): ModelItem & { trainingSession: TrainingSessionPayload } => ({
    datasetSlug: r.dataset_identifier.split('/')[1],
    id: r.id,
    insertedAt: r.inserted_at,
    name: r.name,
    teamId: r.team_id,
    trainingSession: r
  })

export const convertRunningSession = (
  r: RunningSessionPayload
): ModelItem & { runningSession: RunningSessionPayload } => ({
  datasetSlug: null,
  runningSession: r,
  id: r.id,
  insertedAt: r.inserted_at,
  name: r.name,
  teamId: r.team_id
})

export const resolveRunningSessionStatus = (
  r: RunningSessionPayload
): 'starting' | 'stopping' | 'running' | undefined => {
  if (r.meta.num_instances_available > 0 && r.max === 0) { return 'stopping' }
  if (r.meta.num_instances_available > 0) { return 'running' }
  if (r.meta.num_instances_starting > 0) { return 'starting' }
  if (r.max > 0) { return 'starting' }
}

const resolveStatus = (m: ModelItem): ModelStatus => {
  if (m.trainingSession) { return 'training' }
  if (m.trainedModel) { return 'start' }
  return m.runningSession
    ? resolveRunningSessionStatus(m.runningSession) || 'start'
    : 'start'
}

export const sortWrapper = (field: string): (model: ModelItem) => string | number | null => {
  switch (field) {
  case 'dataset':
    return (model: ModelItem) => model.datasetSlug
  case 'date':
    return (model: ModelItem) => model.insertedAt
  case 'status':
    return (model: ModelItem) => resolveStatus(model)
  default:
    return (model: ModelItem) => model.name
  }
}

export const compare: CompareFunction = (a, b, wrapper, modifier) =>
  (wrapper(a) < wrapper(b) ? -1 : 1) * modifier
