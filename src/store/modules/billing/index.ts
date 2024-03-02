import { Module, MutationTree } from 'vuex'

import { RootState } from '@/store/types'

import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import {
  BillingState,
  getInitialState as getBillingInitialState
} from './state'

const namespaced: boolean = true

export const getInitialState = getBillingInitialState

const state: BillingState = getInitialState()

const billing: Module<BillingState, RootState> = {
  namespaced,
  state,
  getters,
  actions,
  mutations: mutations as MutationTree<BillingState>
}

export default billing
