import { download } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  datasetSlug: string,
  teamSlug: string
}

export const downloadDatasetItemReport = async (params: Params) => {
  const { datasetSlug, teamSlug } = params
  const path = `teams/${teamSlug}/datasets/${datasetSlug}/item_reports`

  try {
    const response = await download<BlobPart>(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.DATASET_LOAD)
  }
}
