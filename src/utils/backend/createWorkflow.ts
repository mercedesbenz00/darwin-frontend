import { ApiResponse, DatasetItemPayload } from '@/store/types'
import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, ParsedError, parseError } from '@/utils/error'

type Params = {
  datasetItemId: number
}

type Response = Promise<ApiResponse<DatasetItemPayload> | ParsedError>

/**
 * Instantiates a V1 workflow for the specified dataset item, from the
 * dataset-default workflow template
 *
 * This function is what gives a dataset item a new workflow and makes it usable
 * in /workview.
 */
export const createWorkflow = async (params: Params): Response => {
  const path = `dataset_items/${params.datasetItemId}/workflow`

  try {
    const response = await post<DatasetItemPayload>(path)
    return { data: response.data }
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKFLOW_CREATE)
  }
}
