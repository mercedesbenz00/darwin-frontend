import { remove } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

type Params = {
  datasetSlug: string,
  name: string,
  teamSlug: string
}

export const deleteV2Export = async (params: Params) => {
  const { datasetSlug, name, teamSlug } = params
  const path = `v2/teams/${teamSlug}/datasets/${datasetSlug}/exports/${name}`
  try {
    const response = await remove(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_EXPORT)
  }
}
