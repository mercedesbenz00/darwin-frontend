import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemPayload } from '@/store/types/DatasetItemPayload'

export const UPDATE_ITEM_SELECTION: DatasetMutation<{
  items: DatasetItemPayload[],
  selected: boolean
}> = (state, payload) => {
  const newIds = payload.items.map(i => i.id)

  state.selectedAll = false

  state.selectedItemIds = payload.selected
    ? state.selectedItemIds.filter(id => !newIds.includes(id)).concat(newIds)
    : state.selectedItemIds.filter(id => !newIds.includes(id))
}
