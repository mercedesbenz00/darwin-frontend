import { StoragePayload } from '@/store/types/StoragePayload'
import { put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string,
  storage: StoragePayload
}

/**
 * Update storage by its slug for the specified team
 */
export const updateStorage = async (params: Params) => {
  const path = `teams/${params.teamSlug}/storage/${params.storage.slug}`
  try {
    const response = await put(path, params.storage)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STORAGE_UPDATE)
  }
}
