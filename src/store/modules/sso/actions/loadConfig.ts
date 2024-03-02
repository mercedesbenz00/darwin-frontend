import { AxiosResponse } from 'axios'

import { SSOAction, SSOPayload } from '@/store/modules/sso/types'
import { api, errorMessages, isErrorResponse, parseError } from '@/utils'

export const loadConfig: SSOAction<void> = async ({ commit, rootState }) => {
  const { currentTeam } = rootState.team
  if (!currentTeam) { throw new Error('[sso/loadConfig]: Current team not set') }

  let response: AxiosResponse<SSOPayload>
  try {
    response = await api.get<SSOPayload>(`/teams/${currentTeam.id}/sso/saml`)
  } catch (error: unknown) {
    if (!isErrorResponse(error)) { throw error }

    // 404 is expected when the config is not exists
    if (error.response?.status === 404) {
      commit('SET_CONFIG', '')
      return { data: { idp_metadata: '' } }
    }

    return parseError(error, errorMessages.LOAD_SSO_CONFIG)
  }

  if (response?.data) {
    commit('SET_CONFIG', response.data?.idp_metadata)
  }

  return response
}
