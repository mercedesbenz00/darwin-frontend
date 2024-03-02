import { ApiKeyAction, ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
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
export const attachPermissionToModel: Action = async ({ commit }, payload) => {
  const { apiKey } = payload

  const value = 'runningSession' in payload
    ? `running_session:${payload.runningSession.id}`
    : `trained_model:${payload.trainedModel.id}`

  const permission: ApiKeyPermission = ['run_inference', value]

  const params = {
    apiKeyId: apiKey.id,
    permissions: [...apiKey.permissions, permission]
  }

  const response = await updateApiKey(params)
  if ('data' in response) { commit('PUSH_API_KEY', response.data) }
  return response
}
