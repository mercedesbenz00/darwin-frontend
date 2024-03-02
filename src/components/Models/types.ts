import {
  RunningSessionPayload,
  TrainedModelPayload,
  TrainingSessionPayload
} from '@/utils/wind/types'

export type ModelItem = {
  datasetSlug: string | null
  id: string
  insertedAt: string
  name: string
  teamId: number | null
  runningSession?: RunningSessionPayload
  trainingSession?: TrainingSessionPayload
  trainedModel?: TrainedModelPayload
}
