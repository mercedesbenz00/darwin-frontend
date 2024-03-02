import { AuthAction } from '@/store/modules/auth/types'
import { LoginResponsePayload } from '@/store/types'
import { api, errorMessages, isErrorResponse, parseError, session } from '@/utils'

export type RegisterActionParams = {
  email: string
  firstName: string
  lastName: string
  password: string
  twoFactorAuthEnabled: boolean
  agreedToTos: boolean
  token: string
  hash?: string
}

type Register = AuthAction<RegisterActionParams, LoginResponsePayload>

export const register: Register = async ({ commit }, params) => {
  let response

  try {
    response = await api.post('users/register', {
      email: params.email,
      first_name: params.firstName,
      last_name: params.lastName,
      password: params.password,
      hash: params.hash,
      two_factor_auth_enabled: params.twoFactorAuthEnabled,
      agreed_to_tos: params.agreedToTos,
      token: params.token
    })
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }
    return parseError(error, errorMessages.AUTH_REGISTER)
  }

  const { data } = response
  const meta = {
    // analytics: [['set', 'userId', data.id]]
  }
  commit('SET_AUTHENTICATED', { meta })
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
