import { Getter } from 'vuex'

import { DatasetUploadState } from '@/store/modules/datasetUpload/state'
import { RootState } from '@/store/types'

/**
 * Returns boolean indicating if an upload with specified id is in progress
 */
export const uploadInProgress: Getter<DatasetUploadState, RootState> =
    (state): boolean => state.status === 'started'
