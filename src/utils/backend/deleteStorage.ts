import { remove } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string,
  storageSlug: string
}

/**
 * Delete a storage from the specified team
 */
export const deleteStorage = async (params: Params) => {
  const path = `teams/${params.teamSlug}/storage/${params.storageSlug}`
  try {
    const response = await remove(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STORAGE_DELETE)
  }
}
