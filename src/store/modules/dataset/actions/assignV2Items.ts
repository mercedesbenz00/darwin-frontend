import { DatasetAction } from '@/store/modules/dataset/types'
import {
  MembershipPayload,
  StoreActionPayload,
  V2DatasetItemFilter,
  V2WorkflowPayload
} from '@/store/types'
import { DatasetPayload } from '@/store/types/DatasetPayload'
import { assignV2Items as request } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

type Payload = {
  assignee: MembershipPayload
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
  workflow: V2WorkflowPayload
}

export const assignV2Items: DatasetAction<Payload, void> = async ({ dispatch }, payload) => {
  const params: Parameters<typeof request>[0] = {
    assigneeId: payload.assignee.user_id,
    filters: {
      ...payload.filters,
      dataset_ids: [payload.dataset.id]
    },
    teamSlug: payload.dataset.team_slug,
    workflowId: payload.workflow.id
  }

  const response = await request(params)

  if ('error' in response) { return response }

  const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = {
    dataset: payload.dataset
  }
  dispatch('loadV2DatasetItemCountsThrottled', countsPayload)

  return { data: undefined }
}
