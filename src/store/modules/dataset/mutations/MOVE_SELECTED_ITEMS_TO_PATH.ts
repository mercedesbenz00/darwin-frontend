import { DatasetMutation } from '@/store/modules/dataset/types'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

export const MOVE_SELECTED_ITEMS_TO_PATH: DatasetMutation<string> = (state, path) => {
  if (!state.folderEnabled) { return }

  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  const updatedItems = affectedItems.map(i => ({ ...i, path }))
  PUSH_DATASET_ITEMS(state, updatedItems)
}
