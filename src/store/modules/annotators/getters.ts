import { GetterTree, Getter } from 'vuex'

import { RootState } from '@/store/types'

import { AnnotatorsState } from './types'

const reportByDatasetId: Getter<AnnotatorsState, RootState> =
  (state, getters, rootState) =>
    (datasetId: number) => rootState.dataset.reports.find(r => r.id === datasetId) || null

export const getters: GetterTree<AnnotatorsState, RootState> = {
  reportByDatasetId
}
