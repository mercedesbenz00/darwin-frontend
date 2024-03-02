import { DatasetItemFilter } from '@/store/types'
import { put } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetId: number
  annotationClassId: number
  filter: DatasetItemFilter
}

export const untagDatasetItems = async (params: Params) => {
  const { annotationClassId, datasetId, filter } = params
  const path = `datasets/${datasetId}/untag_items`

  const requestParams = {
    annotation_class_id: annotationClassId,
    filter
  }

  try {
    const response = await put<void>(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_IMAGE_TAG)
  }
}
