import { ApiResponse, V2DatasetItemFilter } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  teamSlug: string
  annotationClassId: number
  filters: V2DatasetItemFilter
}

export const tagDatasetItemsV2 =
  async (params: Params): Promise<ApiResponse<void> | ParsedError> => {
    const { annotationClassId, teamSlug, filters } = params
    const path = `v2/teams/${teamSlug}/items/slots/tags`

    const requestParams = {
      annotation_class_id: annotationClassId,
      filters
    }

    try {
      const response = await post(path, requestParams)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.DATASET_IMAGE_TAG)
    }
  }
