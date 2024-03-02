import { get } from '@/utils/api'
import { parseError, errorMessages, isErrorResponse } from '@/utils/error'

export type Params = {
  teamSlug: string
}

/**
 * Get list of storages by the specified team
 */
export const getStorages = async (params: Params) => {
  const path = `teams/${params.teamSlug}/storage`
  try {
    const response = await get(path)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.STORAGE_GET)
  }
}
