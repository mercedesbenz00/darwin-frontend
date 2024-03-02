import { V2DatasetItemTimeSummaryPayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetItemId: string
  teamSlug: string
}

export const loadV2DatasetItemTimeSummary = async (params: Params) => {
  const path =
      `v2/teams/${params.teamSlug}/items/${params.datasetItemId}/time_summary`

  try {
    const response = await get<V2DatasetItemTimeSummaryPayload>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_ITEM_LOAD)
  }
}
