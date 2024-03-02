import { ActionTree } from 'vuex'

import { DatasetUploadState } from '@/store/modules/datasetUpload/state'
import { RootState } from '@/store/types'

import { addFiles } from './addFiles'
import { continuouslyUploadChunks, continuouslyUploadChunksV2 } from './continuouslyUploadChunks'
import { enqueueUploads } from './enqueueUploads'
import { getFileContent } from './getFileContent'
import { getOtherPlaceholder } from './getOtherPlaceholder'
import { getVideoInfo } from './getVideoInfo'
import { processUploadQueue, processUploadQueueV2 } from './processUploadQueue'
import { removeFiles } from './removeFiles'
import { startUpload, startUploadV2 } from './startUpload'
import { updateFiles } from './updateFiles'

export const actions: ActionTree<DatasetUploadState, RootState> = {
  addFiles,
  continuouslyUploadChunks,
  continuouslyUploadChunksV2,
  enqueueUploads,
  getFileContent,
  getOtherPlaceholder,
  getVideoInfo,
  processUploadQueue,
  processUploadQueueV2,
  removeFiles,
  startUpload,
  startUploadV2,
  updateFiles
}
