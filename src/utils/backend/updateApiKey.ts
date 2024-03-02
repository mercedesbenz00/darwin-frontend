import { ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  apiKeyId: number,
  permissions: ApiKeyPermission[]
}

type BackendParams = Omit<Params, 'apiKeyId'>

export const updateApiKey = async (params: Params) => {
  const path = `api_keys/${params.apiKeyId}`
  const requestParams: BackendParams = {
    permissions: params.permissions
  }

  try {
    const response = await put<ApiKeyPayload>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.API_KEY_UPDATE)
  }
}
