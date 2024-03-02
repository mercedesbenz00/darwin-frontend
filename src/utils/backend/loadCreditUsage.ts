import { CreditUsagePayload } from '@/store/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  teamSlug: string
  type: string
}

/**
 * Simply load credit usage for the specified team
 */
export const loadCreditUsage = async (params: Params) => {
  const { teamSlug, type } = params
  const path = `${teamSlug}/billing/usage/${type}/current`

  let response

  try {
    response = await get<CreditUsagePayload>(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.CREDIT_USAGE_LOAD)
  }
  return response
}
