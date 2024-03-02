import { MutationTree } from 'vuex'

import { DatasetUploadState } from '@/store/modules/datasetUpload/state'

import { ADD_FILES } from './ADD_FILES'
import { ADD_UPLOAD_FILES } from './ADD_UPLOAD_FILES'
import { REMOVE_FILES } from './REMOVE_FILES'
import { RESET_ALL } from './RESET_ALL'
import { RESET_FILES } from './RESET_FILES'
import { SET_COMMON_PATH } from './SET_COMMON_PATH'
import { SET_COMMON_TAGS } from './SET_COMMON_TAGS'
import { SET_COMMON_TAG_CLASSES } from './SET_COMMON_TAG_CLASSES'
import { SET_CURRENT_UPLOAD_FILE } from './SET_CURRENT_UPLOAD_FILE'
import { SET_DATASET_ID } from './SET_DATASET_ID'
import { SET_FILES_DATA } from './SET_FILES_DATA'
import { SET_FILE_DATA } from './SET_FILE_DATA'
import { SET_UPLOAD_STATUS } from './SET_UPLOAD_STATUS'
import { STOP_UPLOAD } from './STOP_UPLOAD'

export const mutations: MutationTree<DatasetUploadState> = {
  ADD_FILES,
  ADD_UPLOAD_FILES,
  REMOVE_FILES,
  RESET_FILES,
  RESET_ALL,
  SET_DATASET_ID,
  SET_FILE_DATA,
  SET_FILES_DATA,
  SET_UPLOAD_STATUS,
  STOP_UPLOAD,
  SET_COMMON_PATH,
  SET_COMMON_TAGS,
  SET_COMMON_TAG_CLASSES,
  SET_CURRENT_UPLOAD_FILE
}
