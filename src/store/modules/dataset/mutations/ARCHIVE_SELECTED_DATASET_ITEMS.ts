import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemStatus } from '@/store/types'

import { PUSH_DATASET_ITEMS } from './PUSH_DATASET_ITEMS'

export const ARCHIVE_SELECTED_DATASET_ITEMS: DatasetMutation<void> = (state) => {
  const affectedItems = state.selectedAll
    ? state.datasetItems
    : state.datasetItems.filter(i => state.selectedItemIds.includes(i.id))

  PUSH_DATASET_ITEMS(
    state,
    affectedItems.map(i => ({ ...i, status: DatasetItemStatus.archived }))
  )
}
