import { AnnotatorAction } from '@/store/modules/annotator/types'
import {
  DatasetItemPayload,
  DatasetItemStatus,
  DatasetItemType,
  DatasetPayload
} from '@/store/types'
import { loadDatasetItems as request } from '@/utils/backend'

type LoadDatasetItemsAction = AnnotatorAction<
  DatasetPayload,
  DatasetItemPayload[]
>

/**
 * Loads items in a dataset.
 *
 * Since the signed in user is an annotator,
 * loaded items will be only those assigned to them.
 *
 * @param {Object} dataset
 * The dataset to load stages for. Should contain at least an id key.
 */
const loadDatasetItems: LoadDatasetItemsAction = async ({ commit }, dataset) => {
  const response = await request({
    datasetId: dataset.id,
    statuses: [DatasetItemStatus.annotate, DatasetItemStatus.review],
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.splitVideo]
  })

  if ('error' in response) {
    return response
  }

  // since this action fetches ALL the items from the dataset, we need to
  // remove old items before we push them in
  commit('REMOVE_ITEMS_FOR_DATASET', dataset.id)
  commit('PUSH_ITEMS', response.data)
  return response as { data: DatasetItemPayload[] }
}

export default loadDatasetItems
