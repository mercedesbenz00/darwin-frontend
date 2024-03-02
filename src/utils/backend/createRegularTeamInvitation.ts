import { post } from '@/utils/api'
import { errorMessages, isErrorResponse, parseError } from '@/utils/error'

type Params = {
  email: string,
  creditAmount: number,
  creditExpirationInDays: number
}

/**
 * Allows an admin to create an invitation for a regular team
 */
export const createRegularTeamInvitation = async (params: Params) => {
  const path = 'admin/users/invitations'
  const requestParams = {
    email: params.email,
    credit_amount: params.creditAmount,
    credit_expiration_in_days: params.creditExpirationInDays
  }

  let response

  try {
    response = await post(path, requestParams)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.ADMIN_TEAM_OWNER_INVITATIONS_CREATE)
  }

  return response
}
