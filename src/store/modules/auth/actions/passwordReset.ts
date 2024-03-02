import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

export type PasswordResetActionParams = {
  password: string
  confirm: string
  token: string
}

type PasswordReset = AuthAction<PasswordResetActionParams, LoginResponsePayload>

/**
 * Password Reset
 * @param password    Password
 * @param confirm     Confirm Password
 * @param token       Token
 */
export const passwordReset: PasswordReset = async ({ commit }, params) => {
  let response

  try {
    response = await api.put('users/reset_password', {
      password: params.password,
      password_confirmation: params.confirm,
      token: params.token
    })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_RESET_PASSWORD)
  }

  const { data } = response
  commit('SET_AUTHENTICATED', true)
  commit('SET_ABILITIES', data.selected_team_abilities)
  commit('user/SET_PROFILE', data, { root: true })
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })

  session.authenticate({
    refreshToken: data.refresh_token,
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  return response
}
