import { AuthAction } from '@/store/modules/auth/types'
import { InvitationPayload } from '@/store/types/InvitationPayload'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

type VerifyInvitation = AuthAction<string, InvitationPayload>

export const verifyInvitation: VerifyInvitation = async ({ commit }, token) => {
  let response

  try {
    response = await api.post('invitations/validate', { token })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_VERIFY_INVITATION)
  }

  commit('SET_INVITATION', response.data)
  return response
}
