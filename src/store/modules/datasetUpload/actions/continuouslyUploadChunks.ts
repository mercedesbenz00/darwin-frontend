import { DatasetUploadAction } from '@/store/modules/datasetUpload/types'

export const continuouslyUploadChunks: DatasetUploadAction<void, void> = async (
  { dispatch, state }
) => {
  const addedFiles = state.files.filter(u => u.data.status === 'added')
  if (addedFiles.length === 0) { return }
  await dispatch('enqueueUploads')
  await dispatch('processUploadQueue')
  dispatch('continuouslyUploadChunks')
}

export const continuouslyUploadChunksV2: DatasetUploadAction<void, void> = async (
  { dispatch, state }
) => {
  const addedFiles = state.files.filter(u => u.data.status === 'added')
  if (addedFiles.length === 0) { return }
  await dispatch('enqueueUploads')
  await dispatch('processUploadQueueV2')
  dispatch('continuouslyUploadChunksV2')
}
