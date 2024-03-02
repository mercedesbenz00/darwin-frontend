import {
  DatasetUploadAction,
  UploadFile,
  UploadFileData
} from '@/store/modules/datasetUpload/types'
import { generateImageWithCenteredText } from '@/utils'

type Payload = UploadFile

export const getOtherPlaceholder: DatasetUploadAction<Payload> = (
  { commit },
  uploadFile
) => {
  if (uploadFile.data.dataURL) { return }
  const fileName = uploadFile.file.name
  const extension = fileName.substr(fileName.lastIndexOf('.')).toLowerCase()
  const dataURL = generateImageWithCenteredText(extension, 50, 50)
  const data: Partial<UploadFileData> = { dataURL }
  commit('SET_FILE_DATA', { uploadFile, data })
}
