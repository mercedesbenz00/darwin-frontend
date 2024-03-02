import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { MembershipPayload } from '@/store/types/MembershipPayload'
import { assignItems as request } from '@/utils/backend'

type Payload = {
  assignee: MembershipPayload,
  dataset: DatasetPayload,
  filter: DatasetItemFilter
}

export const assignItems: DatasetAction<Payload, void> = async ({ commit, dispatch }, payload) => {
  const params: Parameters<typeof request>[0] = {
    assigneeId: payload.assignee.user_id,
    datasetId: payload.dataset.id,
    filter: payload.filter
  }
  const response = await request(params)

  if ('error' in response) { return response }

  commit('ASSIGN_SELECTED_ITEMS', params.assigneeId)
  dispatch('loadDatasetItemCountsThrottled', { dataset: payload.dataset })

  return response
}
