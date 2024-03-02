import { WindAuthAction } from '@/utils/backend'
import { errorMessages } from '@/utils/error'

import { withAuth, withoutAuth } from './api'
import { ModelTemplatePayload, WindResponse } from './types'

type Params = { teamId?: number }

export const loadPublishedModelTemplates = (
  payload: Params
): WindResponse<ModelTemplatePayload[]> => {
  const { teamId } = payload
  const params = {}
  const path = 'model_templates?published'

  if (!teamId) {
    return withoutAuth<ModelTemplatePayload[]>(
      client => client.get<ModelTemplatePayload[]>(path, { params }),
      errorMessages.NEURAL_MODEL_DATA
    )
  }

  const authParams = { action: WindAuthAction.ViewModels, teamId }

  return withAuth<ModelTemplatePayload[]>(
    authParams,
    client => client.get<ModelTemplatePayload[]>(path, { params }),
    errorMessages.NEURAL_MODEL_DATA
  )
}
