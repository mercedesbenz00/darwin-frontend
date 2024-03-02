import { DatasetUploadMutation, UploadFile } from '@/store/modules/datasetUpload/types'

export const SET_CURRENT_UPLOAD_FILE: DatasetUploadMutation<UploadFile | null> =
  (state, uploadFile) => {
    state.currentUploadFile = uploadFile
  }
