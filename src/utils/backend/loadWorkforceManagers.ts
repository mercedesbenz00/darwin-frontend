import { WorkforceManagerPayload } from '@/store/types/WorkforceManagerPayload'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = { datasetId: number }

export const loadWorkforceManagers = async (params: Params) => {
  const { datasetId } = params
  const path = `datasets/${datasetId}/workforce_managers`

  try {
    const response = await get<WorkforceManagerPayload[]>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
