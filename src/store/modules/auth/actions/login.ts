import { AuthAction } from '@/store/modules/auth/types'
import { Login2FAResponsePayload, LoginResponsePayload } from '@/store/types'
import { session } from '@/utils'
import { login as request } from '@/utils/backend'

export type LoginActionParams = {
  email: string
  password: string
  rememberMe: boolean
}

type Login = AuthAction<LoginActionParams, Login2FAResponsePayload | LoginResponsePayload>

/**
 * Login With Email & Password
 * @param email Email to login with
 * @param password Password to login with
 * @param rememberMe Indicates if token should be stored permanently
 */
export const login: Login = async ({ commit, dispatch }, params) => {
  const { email, password, rememberMe } = params

  const response = await request({ email, password })
  if ('error' in response) {
    return response
  }

  const { data } = response
  if ('required_2fa' in data) {
    return response
  }

  commit('SET_AUTHENTICATED', true)
  commit('SET_ABILITIES', data.selected_team_abilities)
  commit('user/SET_PROFILE', data, { root: true })
  commit('team/SET_CURRENT_TEAM', data.selected_team, { root: true })
  commit('team/SET_TEAMS', data.teams, { root: true })

  session.authenticate({
    isPermanent: rememberMe,
    refreshToken: data.refresh_token,
    token: data.token,
    tokenExpiration: data.token_expiration
  })

  // Some features are based on team, so they need to be re-fetched upon login
  await dispatch('features/getFeatures', {}, { root: true })

  return response
}
