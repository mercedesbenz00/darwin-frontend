import { DatasetAction } from '@/store/modules/dataset/types'
import { DatasetItemFilter, DatasetPayload } from '@/store/types'
import { untagDatasetItems } from '@/utils/backend'

type Payload = {
  annotationClassId: number
  dataset: DatasetPayload
}

export const untagSelectedItems: DatasetAction<Payload, void> = async (
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

  const response = await untagDatasetItems({
    annotationClassId,
    datasetId: dataset.id,
    filter
  })

  if ('error' in response) { return response }

  commit('UNTAG_SELECTED_DATASET_ITEMS', annotationClassId)
  dispatch('loadDatasetItemCountsThrottled', { dataset: payload.dataset })

  return response
}
