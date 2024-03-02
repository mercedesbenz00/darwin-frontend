import { DatasetUploadMutation } from '@/store/modules/datasetUpload/types'

export const SET_DATASET_ID: DatasetUploadMutation<number> = (state, datasetId) => {
  state.datasetId = datasetId
}
