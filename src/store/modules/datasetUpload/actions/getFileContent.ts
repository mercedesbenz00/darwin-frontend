import { loadFileContent } from '@/components/Dataset/DropZone/fileUtils'
import { DatasetUploadAction, UploadFile } from '@/store/modules/datasetUpload/types'

type Payload = UploadFile

export const getFileContent: DatasetUploadAction<Payload> = async (
  { commit },
  uploadFile
) => {
  if (uploadFile.data.dataURL) { return }

  let dataURL

  try {
    dataURL = await loadFileContent(uploadFile.file)
  } catch (error: unknown) {
    // TODO: How do we handle this error?
    console.error(error)
    return
  }
  if (!dataURL) { return }

  commit('SET_FILE_DATA', { uploadFile, data: { dataURL } })
}
