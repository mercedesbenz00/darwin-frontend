import { BillingInfoPayload } from '@/store/modules/billing/types'
import { get } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

/**
 * Simply load billing information for the specified team
 */
export const loadBillingInfo = async (teamId: number) => {
  const path = `customers/${teamId}`

  let response

  try {
    response = await get<BillingInfoPayload>(path)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.BILLING_INFO_LOAD)
  }
  return response
}
