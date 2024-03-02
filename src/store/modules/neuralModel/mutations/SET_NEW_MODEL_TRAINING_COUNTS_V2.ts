import { NeuralModelMutation } from '@/store/modules/neuralModel/types'
import { V2DatasetGeneralCountsPayload } from '@/store/types/DatasetItemCountsPayload'

export const SET_NEW_MODEL_TRAINING_COUNTS_V2: NeuralModelMutation<{
  counts: V2DatasetGeneralCountsPayload | null,
  datasetId: number
}> = (state, payload) => {
  const { counts, datasetId } = payload
  if (!counts) {
    state.newModelTrainingCounts = null
    return
  }

  const datasetCounts = counts.simple_counts.find(count => count.dataset_id === datasetId)
  if (!datasetCounts) {
    state.newModelTrainingCounts = null
    return
  }

  state.newModelTrainingCounts = datasetCounts.filtered_item_count
}
