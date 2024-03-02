import { ApiKeyAction, ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
import { createApiKey } from '@/utils/backend'
import { RunningSessionPayload, TrainedModelPayload } from '@/utils/wind/types'

type Payload = {
  name: string
  runningSession: RunningSessionPayload
  teamId: number
} | {
  name: string
  teamId: number
  trainedModel: TrainedModelPayload
}

type Action = ApiKeyAction<Payload, ApiKeyPayload>

/**
 * Create API key for a model.
 *
 * The API key will get created with a single permission to infer the specified model.
 */
export const createForModel: Action = async ({ commit }, payload) => {
  const { teamId, name } = payload

  const value = 'runningSession' in payload
    ? `running_session:${payload.runningSession.id}`
    : `trained_model:${payload.trainedModel.id}`

  const permission: ApiKeyPermission = ['run_inference', value]

  const params = {
    name,
    permissions: [permission],
    teamId
  }

  const response = await createApiKey(params)
  if ('data' in response) { commit('PUSH_API_KEY', response.data) }
  return response
}
