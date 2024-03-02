import { DatasetMutation } from '@/store/modules/dataset/types'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

export const SET_SELECTED_ITEMS_PRIORITY: DatasetMutation<number> = (state, priority) => {
  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  PUSH_DATASET_ITEMS(
    state,
    affectedItems.map(i => ({ ...i, priority }))
  )
}
