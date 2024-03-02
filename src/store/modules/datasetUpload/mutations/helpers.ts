import { UploadFile, UploadFileData } from '@/store/modules/datasetUpload/types'

type SetImageDataPayload = {
  uploadFile: UploadFile
  data: Partial<UploadFileData>
}

type SetVideoDataPayload = {
  uploadFile: UploadFile
  data: Partial<UploadFileData>
  annotateAsFrames: boolean
}

export type SetFileDataPayload = SetImageDataPayload | SetVideoDataPayload

export const isVideoDataPayload =
  (dataPayload: SetFileDataPayload): dataPayload is SetVideoDataPayload =>
    dataPayload.uploadFile.data.category === 'video'
