import { DatasetUploadMutation, UploadFile } from '@/store/modules/datasetUpload/types'

export const REMOVE_FILES: DatasetUploadMutation<UploadFile[]> = (state, uploadFiles) => {
  const removeSet = new Set(uploadFiles)
  state.files = state.files.filter(u => !removeSet.has(u))
}
