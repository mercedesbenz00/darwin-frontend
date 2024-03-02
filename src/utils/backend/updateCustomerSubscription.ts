import { TeamPayload } from '@/store/modules/admin/types'
import { put } from '@/utils/api'
import { isErrorResponse, parseError } from '@/utils/error'
import { errorMessages } from '@/utils/error/errors'

export type Params = {
  teamId: number
  /* eslint-disable camelcase */
  seconds_per_automation_action?: number
  storage_extra?: number
  /* eslint-enable camelcase */
}

/**
 * Sends request to update customer_subscription record for specified team.
 *
 * Each team has one customer record, which, on BILLING_V3,
 * has one customer_subscription record.
 *
 * The endpoint to update it is defined by the team id.
 *
 * Currently, only `seconds_per_automation_action` can be updated, but updating
 * other fields could be allowed eventually.
 */
export const updateCustomerSubscription = async (params: Params) => {
  const { teamId, ...rest } = params
  const path = `admin/teams/${teamId}/customer_subscription`
  const query = rest

  try {
    const response = await put<TeamPayload>(path, query)
    return response
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_TEAM_UPDATE)
  }
}
