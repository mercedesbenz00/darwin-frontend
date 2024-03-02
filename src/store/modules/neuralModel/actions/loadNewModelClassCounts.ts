import { NeuralModelAction } from '@/store/modules/neuralModel/types'
import { DatasetItemStatus } from '@/store/types/DatasetItemStatus'
import { DatasetItemType } from '@/store/types/DatasetItemType'
import { DatasetReportPayload } from '@/store/types/DatasetReportPayload'
import { loadDatasetReport } from '@/utils/backend'

/**
 * Fetches a filtered dataset report, containing class distribution by image and
 * annotation instance, for completed items only.
 */
export const loadNewModelClassCounts: NeuralModelAction<void, DatasetReportPayload> = async (
  { commit, state }
) => {
  const { newModelDataset } = state

  if (!newModelDataset) {
    throw new Error('Cannot fetch dataset counts with no dataset selected')
  }

  // a dataset report will contain class distrubution by item and annotation
  // instance, both of which we need. It also supports filtering, and we are
  // only interested in completed classes.
  const response = await loadDatasetReport({
    datasetId: newModelDataset.id,
    statuses: [DatasetItemStatus.complete],
    types: [DatasetItemType.image, DatasetItemType.playbackVideo, DatasetItemType.videoFrame]
  })

  if ('data' in response) { commit('SET_NEW_MODEL_CLASS_COUNTS', response.data) }

  return response
}
