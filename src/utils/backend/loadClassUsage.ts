import {
  ClassUsagePayload,
  DatasetItemFilter
} from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

export type LoadClassUsageParams = Omit<DatasetItemFilter, 'page' | 'sort'> & {
  teamSlug: string
}

/**
 * Simply load class usage for the specified team
 */
export const loadClassUsage = async (params: LoadClassUsageParams) => {
  const { teamSlug, ...filters } = params
  const path = `/teams/${teamSlug}/annotation_classes/usage`

  try {
    const response = await get<ClassUsagePayload>(path, filters)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.CLASS_USAGE_LOAD)
  }
}
