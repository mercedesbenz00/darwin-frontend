import { loadVideo } from '@/components/Dataset/DropZone/fileUtils'
import { DatasetUploadAction, UploadFile } from '@/store/modules/datasetUpload/types'

type Payload = UploadFile

export const getVideoInfo: DatasetUploadAction<Payload> = async (
  { commit },
  uploadFile
) => {
  if (uploadFile.data.thumbs) { return }

  let videoData: { duration: number, frames: string[] }

  try {
    videoData = await loadVideo(uploadFile.file)
  } catch {
    console.warn('Loading video failed')
    return
  }

  const { duration, frames: thumbs } = videoData
  const data = { duration, thumbs }
  commit('SET_FILE_DATA', { uploadFile, data })
}
