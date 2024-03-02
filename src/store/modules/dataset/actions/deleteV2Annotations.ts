import { DatasetAction } from '@/store/modules/dataset/types'
import {
  DatasetPayload,
  StoreActionPayload,
  V2DatasetItemFilter,
  V2WorkflowPayload
} from '@/store/types'
import { deleteV2Annotations as request } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
  workflow: V2WorkflowPayload
}

/**
 * Discards annotations from 2.0 items defined by the filter
 */
export const deleteV2Annotations: DatasetAction<Payload, void> = async ({ dispatch }, payload) => {
  const params: Parameters<typeof request>[0] = {
    workflowId: payload.workflow.id,
    filters: {
      ...payload.filters,
      dataset_ids: [payload.dataset.id]
    },
    teamSlug: payload.dataset.team_slug
  }

  const response = await request(params)

  if ('error' in response) {
    return response
  }

  const countsPayload: StoreActionPayload<typeof loadV2DatasetItemCountsThrottled> = {
    dataset: payload.dataset
  }

  dispatch('loadV2DatasetItemCountsThrottled', countsPayload)

  return { data: undefined }
}
