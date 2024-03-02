import { DatasetMutation } from '@/store/modules/dataset/types'

export const SET_EXPORT_COMPLETE_COUNT: DatasetMutation<number> = (state, payload) => {
  state.exportCompleteCount = payload
}
