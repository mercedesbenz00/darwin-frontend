import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

export type ConfirmInvitationActionParams = {
  email: string
  firstName: string
  lastName: string
  password: string
  twoFactorAuthEnabled: boolean
  agreedToTos: boolean
  token: string
  hash?: string
}

type ConfirmInvitation = AuthAction<ConfirmInvitationActionParams, LoginResponsePayload>

/**
 * Confirm invitation
 * @param token Invitation Token
 */
export const confirmInvitation: ConfirmInvitation = async ({ commit }, params) => {
  let response
  try {
    response = await api.put('invitations/confirm', {
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      password: params.password,
      hash: params.hash,
      token: params.token,
      two_factor_auth_enabled: params.twoFactorAuthEnabled,
      agreed_to_tos: params.agreedToTos
    })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_CONFIRM_INVITATION)
  }

  const { data } = response
  commit('SET_AUTHENTICATED', true)
  commit('SET_ABILITIES', data.selected_team_abilities)

  session.authenticate({
    refreshToken: data.refresh_token,
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  commit('user/SET_PROFILE', data, { root: true })
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })
  return response
}
