import {
  resolveNewFiles,
  resolveNewSet,
  toUploadFile
} from '@/store/modules/datasetUpload/helpers'
import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

export const ADD_FILES: DatasetUploadMutation<File[]> = (state, files) => {
  const set = resolveNewSet(state)
  const newUploadFiles = resolveNewFiles(state, files).map(f => toUploadFile(f, set))
  state.files = state.files.concat(newUploadFiles)
}
