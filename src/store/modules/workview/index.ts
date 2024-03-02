import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { state, getInitialState as getWorkviewInitialState } from './state'

export const getInitialState = getWorkviewInitialState

const workview = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default workview
