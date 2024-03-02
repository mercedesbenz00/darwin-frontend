import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter, DatasetPayload } from '@/store/types'
import { tagDatasetItemsV2 } from '@/utils/backend'

type Payload = {
  annotationClassId: number
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
}

export const tagSelectedItemsV2: DatasetAction<Payload, void> = async (
  { dispatch, state },
  payload
) => {
  if (!state.selectedAll && state.selectedV2ItemIds.length === 0) {
    return { data: undefined }
  }

  const { annotationClassId, dataset, filters } = payload

  const response = await tagDatasetItemsV2({
    annotationClassId,
    filters: { ...filters, dataset_ids: [dataset.id] },
    teamSlug: dataset.team_slug
  })

  if ('error' in response) { return response }

  dispatch('loadV2DatasetItemCountsThrottled', { dataset: payload.dataset })

  return response
}
