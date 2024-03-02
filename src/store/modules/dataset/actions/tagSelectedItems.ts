import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload } from '@/store/types'
import { tagDatasetItems } from '@/utils/backend'

type Payload = {
  annotationClassId: number
  dataset: DatasetPayload
}

export const tagSelectedItems: DatasetAction<Payload, void> = async (
  { commit, dispatch, state },
  payload
) => {
  if (!state.selectedAll && state.selectedItemIds.length === 0) {
    return { data: undefined }
  }

  const { annotationClassId, dataset } = payload

  const filter: DatasetItemFilter = state.selectedAll
    ? state.datasetItemFilter
    : { dataset_item_ids: state.selectedItemIds }

  const response = await tagDatasetItems({
    annotationClassId,
    datasetId: dataset.id,
    filter
  })

  if ('error' in response) { return response }

  commit('TAG_SELECTED_DATASET_ITEMS', annotationClassId)
  dispatch('loadDatasetItemCountsThrottled', { dataset: payload.dataset })

  return response
}
