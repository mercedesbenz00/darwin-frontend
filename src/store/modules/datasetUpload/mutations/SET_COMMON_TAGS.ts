import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

export const SET_COMMON_TAGS: DatasetUploadMutation<string[]> = (state, tags) => {
  state.tags = [...tags]
}
