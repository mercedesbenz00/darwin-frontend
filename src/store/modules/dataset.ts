import { actions } from './dataset/actions'
import { getters } from './dataset/getters'
import { mutations } from './dataset/mutations'
import { state } from './dataset/state'

export { getInitialState } from './dataset/state'

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
