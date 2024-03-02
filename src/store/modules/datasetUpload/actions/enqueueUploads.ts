import {
  DatasetUploadAction,
  UploadFile,
  UploadFileData
} from '@/store/modules/datasetUpload/types'

const MAX_QUEUE_SIZE = 5

export const enqueueUploads: DatasetUploadAction<void, void> = (
  { commit, state }
) => {
  const processingStates = ['queued', 'signing', 'uploading', 'confirming']
  const processingFiles = state.files.filter(u => processingStates.indexOf(u.data.status) > -1)

  if (processingFiles.length >= MAX_QUEUE_SIZE) { return }

  const filesToQueue =
    state.files
      .filter(uploadFile => uploadFile.data.status === 'added')
      .slice(0, MAX_QUEUE_SIZE - processingFiles.length)

  const fileData: { uploadFile: UploadFile, data: Partial<UploadFileData> }[] =
    filesToQueue.map((u) => ({ uploadFile: u, data: { status: 'queued' } }))

  commit('SET_FILES_DATA', fileData)
}
