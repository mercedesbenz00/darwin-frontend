import { Getter } from 'vuex'

import { UploadFile } from '@/components/Dataset/DropZone/types'
import { TERMINAL_STATUSES } from '@/store/modules/datasetUpload/helpers'
import { DatasetUploadState } from '@/store/modules/datasetUpload/state'
import { RootState } from '@/store/types'

const getUnfinishedFiles = (uploadFiles: UploadFile[]): UploadFile[] => {
  return uploadFiles.filter(u => TERMINAL_STATUSES.indexOf(u.data.status) === -1)
}

export const unfinishedFiles: Getter<DatasetUploadState, RootState> =
  (state): UploadFile[] => getUnfinishedFiles(state.files)
