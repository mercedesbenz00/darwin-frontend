import { WorkflowMutation } from '@/store/modules/workview/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'

export const SET_DATASET_ITEM_FILENAMES: WorkflowMutation<DatasetItemFilenamePayload[]> =
  (state, payload) => {
    state.datasetItemFilenames = payload
  }
