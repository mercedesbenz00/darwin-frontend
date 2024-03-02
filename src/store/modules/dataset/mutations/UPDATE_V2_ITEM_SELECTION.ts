import { DatasetMutation } from '@/store/modules/dataset/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'

export const UPDATE_V2_ITEM_SELECTION: DatasetMutation<{
  items: V2DatasetItemPayload[],
  selected: boolean
}> = (state, payload) => {
  const newIds = payload.items.map(i => i.id)

  state.selectedAll = false

  state.selectedV2ItemIds = payload.selected
    ? state.selectedV2ItemIds.filter(id => !newIds.includes(id)).concat(newIds)
    : state.selectedV2ItemIds.filter(id => !newIds.includes(id))
}
