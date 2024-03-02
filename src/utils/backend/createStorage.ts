import { StoragePayload } from '@/store/types/StoragePayload'
import { post } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string,
  storage: StoragePayload
}

/**
 * Creates a storage for the specified team
 */
export const createStorage = async (params: Params) => {
  const path = `teams/${params.teamSlug}/storage`
  try {
    const response = await post(path, params.storage)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STORAGE_CREATE)
  }
}
