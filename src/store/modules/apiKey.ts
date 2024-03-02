import { GetterTree, ActionTree, MutationTree } from 'vuex'

import { RootState, TeamPayload } from '@/store/types'
import { api, parseError, errorMessages, copyAttributes, isErrorResponse } from '@/utils'

import { attachPermissionToModel } from './apiKey/actions/attachPermissionToModel'
import { createForModel } from './apiKey/actions/createForModel'
import { detachPermissionFromModel } from './apiKey/actions/detachPermissionFromModel'
import { ApiKeyPayload, ApiKeyPermission, ApiKeyState } from './apiKey/types'

export const getInitialState = (): ApiKeyState => ({ apiKeys: [] })

const state = getInitialState()
const getters: GetterTree<ApiKeyState, RootState> = {}

type CreateParams = { name: string, team: TeamPayload, permissions: ApiKeyPermission[]}

const actions: ActionTree<ApiKeyState, RootState> = {
  /**
   * Retrive all API keys for a team with the specified id
   */
  async getKeys ({ commit }) {
    let response

    try {
      response = await api.get('api_keys')
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.API_KEYS_LOAD)
    }

    commit('SET_API_KEYS', response.data)

    return response
  },

  /**
   * Create generic API key for the team and permissions.
   */
  async create ({ commit }, { name, permissions, team }: CreateParams) {
    const path = `teams/${team.id}/api_keys`
    const params = { name, permissions }

    let response

    try {
      response = await api.post(path, params)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.API_KEY_CREATE)
    }

    commit('PUSH_API_KEY', response.data)
    return response
  },

  attachPermissionToModel,
  createForModel,
  detachPermissionFromModel,

  /**
   * Update API key
   */
  async updateKey ({ commit }, { apiKey, params }) {
    const path = `api_keys/${apiKey.id}`
    let response

    try {
      response = await api.put(path, params)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.API_KEY_UPDATE)
    }

    commit('PUSH_API_KEY', response.data)
    return response
  },

  /**
   * Delete specified API key
   */
  async deleteKey ({ commit }, key: ApiKeyPayload) {
    let response

    try {
      response = await api.remove(`api_keys/${key.id}`, {})
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.API_KEY_DELETE)
    }

    commit('REMOVE_API_KEY', key)

    return response
  }
}

const mutations: MutationTree<ApiKeyState> = {
  SET_API_KEYS (state, data: ApiKeyPayload[]) {
    state.apiKeys = data
  },

  PUSH_API_KEY (state, data: ApiKeyPayload) {
    const index = state.apiKeys.findIndex(k => k.id === data.id)
    if (index > -1) {
      state.apiKeys.splice(index, 1, data)
    } else {
      state.apiKeys.push(data)
    }
  },

  REMOVE_API_KEY (state, key: ApiKeyPayload) {
    const index = state.apiKeys.findIndex(k => k.id === key.id)
    if (index > -1) {
      state.apiKeys.splice(index, 1)
    }
  },

  RESET_ALL (state) {
    copyAttributes(state, getInitialState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
