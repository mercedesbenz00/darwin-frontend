import { DatasetUploadMutation, UploadFile } from '@/store/modules/datasetUpload/types'

export const ADD_UPLOAD_FILES: DatasetUploadMutation<UploadFile[]> = (state, files) => {
  state.files = [...files, ...state.files]
}
