import actions from './actions'
import getters from './getters'
import mutations from './mutations'
import { getInitialState as getCommentInitialState } from './state'

export const getInitialState = getCommentInitialState

const state = getInitialState()

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
