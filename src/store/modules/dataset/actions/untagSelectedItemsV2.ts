import { DatasetAction } from '@/store/modules/dataset/types'
import { V2DatasetItemFilter, DatasetPayload } from '@/store/types'
import { untagDatasetItemsV2 } from '@/utils/backend'

type Payload = {
  annotationClassId: number
  dataset: DatasetPayload
  filters: Omit<V2DatasetItemFilter, 'dataset_ids'>
}

export const untagSelectedItemsV2: DatasetAction<Payload, void> = async (
  { dispatch, state },
  payload
) => {
  if (!state.selectedAll && state.selectedV2ItemIds.length === 0) {
    return { data: undefined }
  }

  const { annotationClassId, dataset, filters } = payload

  const response = await untagDatasetItemsV2({
    annotationClassId,
    teamSlug: dataset.team_slug,
    filters: { ...filters, dataset_ids: [dataset.id] }
  })

  if ('error' in response) { return response }

  dispatch('loadV2DatasetItemCountsThrottled', { dataset: payload.dataset })

  return response
}
