import { ApiKeyPayload, ApiKeyPermission } from '@/store/modules/apiKey/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  name: string,
  teamId: number,
  permissions: ApiKeyPermission[]
}

type BackendParams = Omit<Params, 'teamId'>

export const createApiKey = async (params: Params) => {
  const path = `teams/${params.teamId}/api_keys`

  const requestParams: BackendParams = {
    name: params.name,
    permissions: params.permissions
  }

  try {
    const response = await post<ApiKeyPayload>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.API_KEY_CREATE)
  }
}
