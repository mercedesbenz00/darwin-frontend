import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { DatasetItemType } from '@/store/types/DatasetItemType'
import { loadDatasetItems as requestV1, loadV2DatasetItems as requestV2 } from '@/utils/backend'

/**
 * Fetches a sampling of dataset items from the store.
 *
 * Can be called repeatedly to fetch more items.
 */
export const loadSampleDatasetItems: NeuralModelAction<void> = async ({ commit, state }) => {
  const { newModelDataset } = state

  if (!newModelDataset) {
    throw new Error('Cannot fetch sample items with no dataset selected')
  }

  let response
  if (newModelDataset.version === 2) {
    response = await requestV2({
      dataset_ids: [newModelDataset.id],
      include_thumbnails: true,
      page: {
        from: state.newModelSampleItemsCursor || undefined,
        size: 20
      },
      statuses: [DatasetItemStatus.complete],
      teamSlug: newModelDataset.team_slug
    })

    if ('data' in response && 'items' in response.data) {
      commit('PUSH_NEW_MODEL_SAMPLE_ITEMS_V2', response.data.items)
      commit('SET_NEW_MODEL_SAMPLE_ITEMS_CURSOR', response.data.page.next)
    }
  } else {
    response = await requestV1({
      datasetId: newModelDataset.id,
      page: {
        from: state.newModelSampleItemsCursor || undefined,
        size: 20
      },
      statuses: [DatasetItemStatus.complete],
      types: [
        DatasetItemType.image,
        DatasetItemType.playbackVideo,
        DatasetItemType.videoFrame
      ]
    })

    if ('data' in response && 'items' in response.data) {
      commit('PUSH_NEW_MODEL_SAMPLE_ITEMS', response.data.items)
      commit('SET_NEW_MODEL_SAMPLE_ITEMS_CURSOR', response.data.metadata.next)
    }
  }

  return response
}
