import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

export const RESET_FILES: DatasetUploadMutation<void> = (state) => {
  state.files = []
}
