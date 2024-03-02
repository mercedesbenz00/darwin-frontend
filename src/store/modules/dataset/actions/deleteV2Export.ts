import { DatasetAction } from '@/store/modules/dataset/types'
import { deleteV2Export as request } from '@/utils/backend'

type Payload = Parameters<typeof request>[0]
type Action = DatasetAction<Payload>

export const deleteV2Export: Action = async ({ commit }, params) => {
  const response = await request(params)
  if ('data' in response) {
    commit('DELETE_EXPORT', params.name)
  }
  return response
}
