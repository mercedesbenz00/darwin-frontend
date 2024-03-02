import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { DatasetItemType } from '@/store/types/DatasetItemType'
import { loadDatasetGeneralCounts, loadV2DatasetGeneralCounts } from '@/utils/backend'

/**
 * Fetches dataset item counts for specified new model dataset and selected classes,
 * and pushes into store. Used to determine counts for training validation and
 * test sets.
 */
export const loadNewModelTrainingCounts: NeuralModelAction<void> = async ({ commit, state }) => {
  const { newModelDataset, newModelSelectedClassIds } = state

  if (!newModelDataset) {
    throw new Error('Cannot fetch dataset counts with no dataset selected')
  }

  if (newModelSelectedClassIds.length === 0) {
    throw new Error('Cannot fetch dataset counts with no classes selected')
  }

  // we load counts for the selected dataset, selected classes, completed items only
  const params = {
    annotation_class_ids: newModelSelectedClassIds,
    statuses: [DatasetItemStatus.complete],
    teamSlug: newModelDataset.team_slug
  }

  if (newModelDataset.version === 2) {
    const response = await loadV2DatasetGeneralCounts({
      dataset_ids: [newModelDataset.id],
      ...params
    })

    if ('data' in response) {
      commit('SET_NEW_MODEL_TRAINING_COUNTS_V2', {
        counts: response.data,
        datasetId: newModelDataset.id
      })
    }

    return response
  }

  const response = await loadDatasetGeneralCounts({
    datasetSlug: newModelDataset.slug,
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame],
    unroll_videos: true,
    ...params
  })

  if ('data' in response) {
    commit('SET_NEW_MODEL_TRAINING_COUNTS', response.data)
  }

  return response
}
