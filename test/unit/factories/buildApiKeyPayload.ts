import { ApiKeyPayload } from '@/store/modules/apiKey/types'

type Params = Partial<ApiKeyPayload>

export const buildApiKeyPayload = (params: Params): ApiKeyPayload => ({
  id: -1,
  team_id: -1,
  user_id: -1,
  name: '',
  prefix: '',
  permissions: [],
  ...params
})
