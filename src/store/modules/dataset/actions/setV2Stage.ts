import { DatasetAction } from '@/store/modules/dataset/types'
import {
  DatasetPayload,
  StoreActionPayload,
  V2DatasetItemFilter,
  V2WorkflowPayload,
  V2WorkflowStagePayload
} from '@/store/types'
import { setV2Stage as request } from '@/utils/backend'

import { loadV2DatasetItemCountsThrottled } from './loadV2DatasetItemCountsThrottled'

type Payload = {
  dataset: DatasetPayload,
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>,
  stage: V2WorkflowStagePayload,
  workflow: V2WorkflowPayload
}

/**
 * Moves all 2.0 items defined by the filter to the specified workflow 2.0 stage.
 */
export const setV2Stage: DatasetAction<Payload, void> = async ({ dispatch }, payload) => {
  const params: Parameters<typeof request>[0] = {
    workflowId: payload.workflow.id,
    filters: {
      ...payload.filters,
      dataset_ids: [payload.dataset.id]
    },
    stageId: payload.stage.id,
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
