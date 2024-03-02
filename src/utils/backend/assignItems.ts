import { DatasetItemFilter } from '@/store/types/DatasetItemFilter'
import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

type Params = {
  assigneeId: number
  datasetId: number
  filter: DatasetItemFilter
}

export const assignItems = async (params: Params) => {
  const path = `datasets/${params.datasetId}/assign_items`
  const requestParams = {
    assignee_id: params.assigneeId,
    filter: params.filter
  }
  try {
    const response = await post(path, requestParams)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.WORKVIEW_IMAGES_LOAD)
  }
}
