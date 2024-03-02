import { actions } from './actions'
import { mutations } from './mutations'
import { state, getInitialState } from './state'

export { getInitialState }

export default {
  namespaced: true,
  state,
  getters: {},
  actions,
  mutations
}
