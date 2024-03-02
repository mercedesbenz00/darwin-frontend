import { ActionTree, MutationTree, GetterTree } from 'vuex'

import { ApiResponse, FeaturePayload, RootState } from '@/store/types'
import { api, parseError, errorMessages, isErrorResponse } from '@/utils'

export type FeaturesState = {
  list: FeaturePayload[] | null
}

export const getInitialState: () => FeaturesState = () => ({ list: null })

const state = getInitialState()

const getters: GetterTree<FeaturesState, RootState> = {
  isFeatureEnabled: state => (feature: string): boolean => {
    const features = state.list
    return !!features && features.some(f => f.name === feature && f.enabled)
  }
}

const actions: ActionTree<FeaturesState, RootState> = {
  async getFeatures ({ commit, rootState }) {
    let response: ApiResponse<FeaturePayload[]>

    const path = rootState.team.currentTeam
      ? `teams/${rootState.team.currentTeam.id}/features`
      : 'features'

    try {
      response = await api.get(path)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.GET_FEATURES)
    }

    commit('SET_FEATURES', response.data)

    return response
  }

}

const mutations: MutationTree<FeaturesState> = {
  SET_FEATURES (state, features: FeaturePayload[]) {
    state.list = features
  }
}

export default {
  actions,
  state,
  getters,
  mutations,
  namespaced: true
}
