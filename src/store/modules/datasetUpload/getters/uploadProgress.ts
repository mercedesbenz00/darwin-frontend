import { Getter } from 'vuex'

import { DatasetUploadState } from '@/store/modules/datasetUpload/state'
import { RootState } from '@/store/types'

/**
 * Returns progress for an upload specified by id
 */
export const uploadProgress: Getter<DatasetUploadState, RootState> =
    (state, getters): number | null =>
      getters.uploadProgressForFiles(state.files)
