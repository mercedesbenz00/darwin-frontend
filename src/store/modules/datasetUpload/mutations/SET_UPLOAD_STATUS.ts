import { DatasetUploadMutation, UploadStatus } from '@/store/modules/datasetUpload/types'

export const SET_UPLOAD_STATUS: DatasetUploadMutation<UploadStatus> = (state, status) => {
  state.status = status
}
