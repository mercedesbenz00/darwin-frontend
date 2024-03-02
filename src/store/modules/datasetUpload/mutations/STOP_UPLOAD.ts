import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

/**
 * Sets upload status to 'stopped' and clears the queue. The intention of this mutation is
 * to put the current upload in a stopped, unresumable state.
 */
export const STOP_UPLOAD: DatasetUploadMutation<void> = (state) => {
  state.status = 'stopped'
  state.files = []
}
