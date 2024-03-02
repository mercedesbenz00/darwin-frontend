import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

import { isVideoDataPayload, SetFileDataPayload } from './helpers'

export const SET_FILES_DATA: DatasetUploadMutation<SetFileDataPayload[]> = (state, payload) => {
  // payload is { uploadFile, data: newData }[]
  // we want to replace all files in state at once, though, so
  // we map by file name, then map state.files to give them new data if needed
  const mapped = Object.fromEntries(payload.map(p => [p.uploadFile.file.name, p]))

  state.files = state.files.map(uploadFile => {
    const mappedFile = mapped[uploadFile.file.name]
    if (mappedFile) {
      const { uploadFile, data: newData } = mappedFile
      const { data: oldData } = uploadFile

      return {
        ...uploadFile,
        data: { ...oldData, ...newData },
        ...(isVideoDataPayload(mappedFile) && { annotateAsFrames: mappedFile.annotateAsFrames })
      }
    }

    return uploadFile
  })
}
