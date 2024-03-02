import { Module } from 'vuex'

import { RootState } from '@/store/types'

import { actions } from './actions'
import { getters } from './getters'
import { mutations } from './mutations'
import { state, DatasetUploadState } from './state'

export { getInitialState } from './state'

const datasetUpload: Module<DatasetUploadState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default datasetUpload
