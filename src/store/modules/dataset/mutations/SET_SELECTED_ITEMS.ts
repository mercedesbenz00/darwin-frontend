import { DatasetMutation } from '@/store/modules/dataset/types'
import { V2DatasetItemPayload } from '@/store/types/V2DatasetItemPayload'

export const SET_SELECTED_ITEMS: DatasetMutation<V2DatasetItemPayload['id'][]> = (state, ids) => {
  state.unselectedV2ItemIds = []
  state.selectedV2ItemIds = ids
}
