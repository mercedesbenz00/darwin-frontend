import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

export const SET_COMMON_PATH: DatasetUploadMutation<string> = (state, path) => {
  state.path = path
}
