import { DatasetMutation } from '@/store/modules/dataset/types'

import { REMOVE_DATASET_ITEMS_BY_IDS } from './REMOVE_DATASET_ITEMS_BY_IDS'

export const REMOVE_SELECTED_DATASET_ITEMS: DatasetMutation<void> = (state) => {
  const ids = state.selectedAll
    ? state.datasetItems.map(d => d.id)
    : state.selectedItemIds
  REMOVE_DATASET_ITEMS_BY_IDS(state, ids)
}
