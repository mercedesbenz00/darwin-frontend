import Vue from 'vue'
import { GetterTree, ActionTree, MutationTree, Module } from 'vuex'

import { LoadingStatus, RootState } from '@/store/types'

export type LoadingState = {
  loadingStatus: {
    [key: string]: LoadingStatus
  }
}

export const getInitialState = (): LoadingState => ({
  loadingStatus: {}
})

const state: LoadingState = getInitialState()

// getters
const getters: GetterTree<LoadingState, RootState> = {}

// actions
const actions: ActionTree<LoadingState, RootState> = {}

// mutations
const mutations: MutationTree<LoadingState> = {
  SET_ACTION_LOADING_STATUS (state, payload: { key: string, status: LoadingStatus }) {
    const { key, status } = payload
    Vue.set(state.loadingStatus, key, status)
  }
}

const loading: Module<LoadingState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default loading
