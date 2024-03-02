import { put } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string,
  storageSlug: string
}

/**
 * Set the storage as default for the specified team
 * Only one storage per team can be set as default
 */
export const setStorageAsDefault = async (params: Params) => {
  const path = `teams/${params.teamSlug}/storage/${params.storageSlug}/default`
  try {
    const response = await put(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STORAGE_CREATE)
  }
}
