import { NeuralModelMutation } from '@/store/modules/neuralModel/types'
import { DatasetItemCountsPayload } from '@/store/types/DatasetItemCountsPayload'

export const SET_NEW_MODEL_TRAINING_COUNTS: NeuralModelMutation<DatasetItemCountsPayload | null> = (
  state,
  counts
) => {
  state.newModelTrainingCounts = counts ? counts.item_count : null
}
