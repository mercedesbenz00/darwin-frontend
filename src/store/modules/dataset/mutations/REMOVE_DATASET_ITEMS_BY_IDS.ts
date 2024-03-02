import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

export const REMOVE_DATASET_ITEMS_BY_IDS: DatasetMutation<DatasetItemPayload['id'][]> =
  (state, ids) => {
    state.datasetItems = state.datasetItems.filter(i => !ids.includes(i.id))
    state.selectedItemIds = state.selectedItemIds.filter(id => !ids.includes(id))
  }
