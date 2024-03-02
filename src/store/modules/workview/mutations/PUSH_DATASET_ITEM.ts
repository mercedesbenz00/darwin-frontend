import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

export const PUSH_DATASET_ITEM: WorkflowMutation<DatasetItemPayload> =
  (state, item: DatasetItemPayload) => {
    const idx = state.datasetItems.findIndex(d => d.id === item.id)
    if (idx < 0) {
      state.datasetItems.push(item)
    } else {
      state.datasetItems.splice(idx, 1, item)
    }
  }
