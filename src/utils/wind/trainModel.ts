import { ModelDevice } from '@/store/modules/neuralModel/types'
import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth } from './api'
import { TrainingClass, TrainingSessionPayload, WindResponse } from './types'

type Params = {
  classes: Omit<TrainingClass, 'id'>[]
  datasetId: number
  datasetSlug: string
  datasetVersion: number
  device: ModelDevice
  modelTemplateId: string
  name: string
  teamId: number
  teamSlug: string
 }

export const trainModel = (params: Params): WindResponse<TrainingSessionPayload> => {
  const {
    classes,
    datasetId,
    datasetSlug,
    datasetVersion,
    device,
    modelTemplateId,
    name,
    teamId,
    teamSlug
  } = params
  const authParams = { action: WindAuthAction.TrainModels, teamId }

  const path = `model_templates/${modelTemplateId}/training_sessions`

  const body = {
    classes,
    dataset_id: datasetId,
    dataset_identifier: `${teamSlug}/${datasetSlug}`,
    dataset_version: datasetVersion,
    device,
    name,
    team_id: teamId
  }

  return withAuth<TrainingSessionPayload>(
    authParams,
    client => client.post<TrainingSessionPayload>(path, body),
    errorMessages.NEURAL_MODEL_TRAIN
  )
}
