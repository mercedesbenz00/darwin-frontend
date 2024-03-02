import { getInitialState } from '@/store/modules/datasetUpload/state'
import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'
import { copyAttributes } from '@/utils'

export const RESET_ALL: DatasetUploadMutation<void> = (state) => {
  copyAttributes(state, getInitialState())
}
