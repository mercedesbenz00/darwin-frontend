import { AuthAction } from '@/store/modules/auth/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type VerifyTeamOwnerInvitation = AuthAction<string, InvitationPayload>

export const verifyTeamOwnerInvitation: VerifyTeamOwnerInvitation = async (_, token) => {
  let response

  try {
    response = await api.post('users/invitations/validate', { token })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_VERIFY_TEAM_OWNER_INVITATION)
  }

  return response
}
