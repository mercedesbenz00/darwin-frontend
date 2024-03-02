import { ApiKeyAction, ApiKeyPayload } from '@/store/modules/apiKey/types'
import { updateApiKey } from '@/utils/backend'
import { RunningSessionPayload, TrainedModelPayload } from '@/utils/wind/types'

type Payload = {
  apiKey: ApiKeyPayload
  runningSession: RunningSessionPayload
} | {
  apiKey: ApiKeyPayload
  trainedModel: TrainedModelPayload
}

type Action = ApiKeyAction<Payload, ApiKeyPayload>

/**
 * Attach permission to infer the specified model to the specified API key
 */
export const detachPermissionFromModel: Action = async ({ commit }, payload) => {
  const { apiKey } = payload

  const valueToRemove = 'runningSession' in payload
    ? `running_session:${payload.runningSession.id}`
    : `trained_model:${payload.trainedModel.id}`

  const permissions = apiKey.permissions.filter(p => p[1] !== valueToRemove)

  const params = {
    apiKeyId: apiKey.id,
    permissions
  }

  const response = await updateApiKey(params)
  if ('data' in response) { commit('PUSH_API_KEY', response.data) }
  return response
}
