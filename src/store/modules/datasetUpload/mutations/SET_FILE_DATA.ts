import { DatasetUploadMutation, UploadVideo } from '@/store/modules/datasetUpload/types'

import { isVideoDataPayload, SetFileDataPayload } from './helpers'

export const SET_FILE_DATA: DatasetUploadMutation<SetFileDataPayload> = (state, payload) => {
  const { uploadFile, data } = payload
  const { data: oldData } = uploadFile
  uploadFile.data = { ...oldData, ...data }

  if (isVideoDataPayload(payload)) {
    (uploadFile as UploadVideo).annotateAsFrames = payload.annotateAsFrames
  }
}
