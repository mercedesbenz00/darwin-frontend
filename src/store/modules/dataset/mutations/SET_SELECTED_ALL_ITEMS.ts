import { DatasetMutation } from '@/store/modules/dataset/types'

export const SET_SELECTED_ALL_ITEMS: DatasetMutation<boolean> = (state, selected) => {
  state.selectedAll = selected

  if (selected) {
    state.selectedItemIds = state.datasetItems.map(i => i.id)
  } else {
    state.selectedItemIds = []
  }
}
