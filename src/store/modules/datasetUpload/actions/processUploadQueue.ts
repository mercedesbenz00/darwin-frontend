import { signFile, sendFile } from '@/components/Dataset/DropZone/urlsigner'
import { confirmFileUpload } from '@/store/modules/dataset/actions/confirmFileUpload'
import { DatasetUploadAction, UploadFileData } from '@/store/modules/datasetUpload/types'
import { StoreActionPayload } from '@/store/types'

export const processUploadQueue: DatasetUploadAction<void, void> = async (
  { commit, dispatch, state }
) => {
  const chunk = state.files
    .filter(u => u.data.status === 'queued')
    .map(async uploadFile => {
      const { file, data } = uploadFile
      const { datasetItemId, blocked } = data
      const config = { signingURL: data.signingURL }
      if (!datasetItemId) {
        throw new Error('Cannot process file without datasetItemId')
      }

      const fileData: Partial<UploadFileData> = blocked
        ? { blocked, status: 'uploaded-reported' }
        : { status: 'signing' }
      commit('SET_FILE_DATA', { uploadFile, data: fileData })

      if (blocked) { return }

      let signResponse

      try {
        signResponse = await signFile(file, config)
      } catch {
        return commit('SET_FILE_DATA', { uploadFile, data: { status: 'error-signing' } })
      }

      commit('SET_FILE_DATA', { uploadFile, data: { status: 'uploading', ...signResponse } })

      const sendConfig = {
        ...signResponse,
        onProgress (sentBytes: number, totalBytes: number): void {
          commit('SET_FILE_DATA', { uploadFile, data: { sentBytes, totalBytes } })
        }
      }

      try {
        await sendFile(file, sendConfig)
      } catch {
        dispatch(
          'toast/warning',
          { content: `${file.name} could not be uploaded.`, duration: 3000 },
          { root: true }
        )
        return commit('SET_FILE_DATA', { uploadFile, data: { status: 'error-uploading' } })
      }

      commit('SET_FILE_DATA', { uploadFile, data: { status: 'reporting' } })
      const confirmFileUploadPayload: StoreActionPayload<typeof confirmFileUpload> = {
        datasetItemId
      }
      const response = await dispatch(
        'dataset/confirmFileUpload',
        confirmFileUploadPayload,
        { root: true }
      )

      const status = response.data ? 'uploaded-reported' : 'error-reporting'
      commit('SET_FILE_DATA', { uploadFile, data: { status } })
    })

  await Promise.all(chunk)
}

export const processUploadQueueV2: DatasetUploadAction<void, void> = async (
  { commit, dispatch, state }
) => {
  const chunk = state.files
    .filter(u => u.data.status === 'queued')
    .map(async uploadFile => {
      const { file, data } = uploadFile
      const { teamSlug, uploadId, blocked } = data
      const config = { signingURL: data.signingURL }

      const fileData: Partial<UploadFileData> = blocked
        ? { blocked, status: 'uploaded-reported' }
        : { status: 'signing' }
      commit('SET_FILE_DATA', { uploadFile, data: fileData })

      if (blocked) { return }

      let signResponse

      try {
        signResponse = await signFile(file, config)
      } catch {
        return commit('SET_FILE_DATA', { uploadFile, data: { status: 'error-signing' } })
      }

      commit('SET_FILE_DATA', { uploadFile, data: { status: 'uploading', ...signResponse } })

      const sendConfig = {
        ...signResponse,
        onProgress (sentBytes: number, totalBytes: number): void {
          commit('SET_FILE_DATA', { uploadFile, data: { sentBytes, totalBytes } })
        }
      }

      try {
        await sendFile(file, sendConfig)
      } catch {
        dispatch(
          'toast/warning',
          { content: `${file.name} could not be uploaded.`, duration: 3000 },
          { root: true }
        )
        return commit('SET_FILE_DATA', { uploadFile, data: { status: 'error-uploading' } })
      }

      commit('SET_FILE_DATA', { uploadFile, data: { status: 'reporting' } })
      const confirmFileUploadPayload: StoreActionPayload<typeof confirmFileUpload> = {
        teamSlug,
        uploadId
      }
      const response = await dispatch(
        'dataset/confirmFileUploadV2',
        confirmFileUploadPayload,
        { root: true }
      )

      const status = response.data ? 'uploaded-reported' : 'error-reporting'
      commit('SET_FILE_DATA', { uploadFile, data: { status } })
    })

  await Promise.all(chunk)
}
