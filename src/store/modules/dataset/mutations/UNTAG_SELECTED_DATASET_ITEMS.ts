import { DatasetMutation } from '@/store/modules/dataset/types'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

export const UNTAG_SELECTED_DATASET_ITEMS: DatasetMutation<number> = (state, classId) => {
  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  const taggedItems = affectedItems.map(i => ({
    ...i,
    labels: i.labels.filter(l => l !== classId)
  }))

  PUSH_DATASET_ITEMS(state, taggedItems)
}
