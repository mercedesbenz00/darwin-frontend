import { ApiResponse, V2DatasetItemFilter, V2ItemsStageCountsPayload } from '@/store/types'
import { getV2 } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError, ParsedError } from '@/utils/error'

type Params = {
  filters: V2DatasetItemFilter
  teamSlug: string
}

export const loadV2ItemsStageCounts = async (
  params: Params
): Promise<ApiResponse<V2ItemsStageCountsPayload> | ParsedError> => {
  const { teamSlug, filters } = params
  const path = `v2/teams/${teamSlug}/items/stage_counts`

  try {
    const { data } = await getV2<V2ItemsStageCountsPayload>(path, filters)
    return { data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
