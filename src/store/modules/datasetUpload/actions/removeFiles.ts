import { DatasetUploadAction, UploadFile } from '@/store/modules/datasetUpload/types'

type Payload = UploadFile[]
type Response = UploadFile[]

export const removeFiles: DatasetUploadAction<Payload, Response> = (
  { commit },
  uploadFiles
) => {
  commit('REMOVE_FILES', uploadFiles)
}
