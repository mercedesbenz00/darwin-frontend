import {
  DatasetItemFilter,
  DatasetItemPayload,
  PagedApiResponse,
  PaginationParams
} from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type LoadDatasetItemsParams =
  DatasetItemFilter & { datasetId: number, ids?: number[], page?: PaginationParams }

/**
 * Retrieves list of dataset items from the backend
 *
 * Supports pagination, filtering and ordering.
 */
export const loadDatasetItems =
  async <T = DatasetItemPayload[]>(params: LoadDatasetItemsParams) => {
    const { datasetId, ...filters } = params
    const path = `datasets/${datasetId}/items`

    try {
      const response = filters.page
        ? await get<PagedApiResponse<DatasetItemPayload>>(path, filters)
        : await get<T>(path, filters)
      return response
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
    }
  }
