import { DatasetMutation } from '@/store/modules/dataset/types'
import { DatasetItemFilenamePayload } from '@/store/types/DatasetItemFilenamePayload'

export const SET_DATASET_ITEM_FILENAMES: DatasetMutation<DatasetItemFilenamePayload[]> =
  (state, payload) => {
    state.datasetItemFilenames = payload
  }
