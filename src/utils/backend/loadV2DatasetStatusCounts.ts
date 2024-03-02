import { V2DatasetItemFilter, V2DatasetStatusCountsPayload } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type LoadDatasetStatusCountsParams = V2DatasetItemFilter & { teamSlug: string }

export const loadV2DatasetStatusCounts = async (params: LoadDatasetStatusCountsParams) => {
  const { teamSlug, ...filters } = params
  const path = `v2/teams/${teamSlug}/items/status_counts`

  try {
    const { data } = await getV2<V2DatasetStatusCountsPayload>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
