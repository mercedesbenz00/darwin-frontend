import {
  DatasetUploadAction,
  UploadFile,
  UploadFileData
} from '@/store/modules/datasetUpload/types'

type Payload = {
  files: UploadFile[]
  data: Partial<UploadFileData>
}

export const updateFiles: DatasetUploadAction<Payload> = (
  { commit },
  { files, data }
) => {
  files.forEach((file) => {
    commit('SET_FILE_DATA', { uploadFile: file, data })
  })
}
