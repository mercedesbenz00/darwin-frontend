import { resolveNewFiles, toUploadFile, resolveNewSet } from '@/store/modules/datasetUpload/helpers'
import { DatasetUploadAction, UploadFile } from '@/store/modules/datasetUpload/types'

type Payload = FileList | File[]
type Response = UploadFile[]

export const addFiles: DatasetUploadAction<Payload, Response> = (
  { commit, state },
  fileList
) => {
  const set = resolveNewSet(state)
  const addedUploadFiles = resolveNewFiles(state, fileList)
    .map(f => toUploadFile(
      f,
      set,
      state.tags,
      state.path
    ))
  commit('ADD_UPLOAD_FILES', addedUploadFiles)

  return { data: addedUploadFiles }
}
