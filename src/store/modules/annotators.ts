import { actions } from './annotators/actions'
import { getters } from './annotators/getters'
import { mutations } from './annotators/mutations'
import { state } from './annotators/state'

export { getInitialState } from './annotators/state'

/**
 * Store module used to support the /annotators page, which shows annotation stats & reports
 */
export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
