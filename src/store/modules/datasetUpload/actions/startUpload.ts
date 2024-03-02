import { DatasetUploadAction } from '@/store/modules/datasetUpload/types'

export const startUpload: DatasetUploadAction<void, void> = (
  { commit, dispatch }
) => {
  commit('SET_UPLOAD_STATUS', 'started')
  dispatch('continuouslyUploadChunks')
}

export const startUploadV2: DatasetUploadAction<void, void> = (
  { commit, dispatch }
) => {
  commit('SET_UPLOAD_STATUS', 'started')
  dispatch('continuouslyUploadChunksV2')
}
