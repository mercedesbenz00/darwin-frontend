import { GetterTree } from 'vuex'

import { RootState } from '@/store/types'

import { imageCount } from './getters/imageCount'
import { unfinishedFiles } from './getters/unfinishedFiles'
import { uploadInProgress } from './getters/uploadInProgress'
import { uploadProgress } from './getters/uploadProgress'
import { uploadProgressForFiles } from './getters/uploadProgressForFiles'
import { DatasetUploadState } from './state'

export const getters: GetterTree<DatasetUploadState, RootState> = {
  imageCount,
  unfinishedFiles,
  uploadInProgress,
  uploadProgress,
  uploadProgressForFiles
}
