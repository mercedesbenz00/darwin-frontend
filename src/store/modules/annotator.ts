import { GetterTree, ActionTree, MutationTree } from 'vuex'

import {
  DatasetPayload,
  DatasetItemPayload,
  RootState,
  V2WorkflowPayload
} from '@/store/types'
import { api, errorMessages, parseError, copyAttributes, isErrorResponse } from '@/utils'
import { loadV2Workflows } from '@/utils/backend'

import loadDatasetItems from './annotator/actions/loadDatasetItems'
import requestWork from './annotator/actions/requestWork'

export type AnnotatorState = {
  loaded: boolean
  loading: boolean,
  datasets: DatasetPayload[],
  items: DatasetItemPayload[],
  workflows: V2WorkflowPayload[],
}

export const getInitialState = (): AnnotatorState => ({
  loaded: false,
  loading: false,
  datasets: [],
  items: [],
  workflows: []
})

const state: AnnotatorState = getInitialState()

const getters: GetterTree<AnnotatorState, RootState> = {}

const actions: ActionTree<AnnotatorState, RootState> = {
  loadDatasetItems,
  requestWork,
  /**
   * Load all datasets accessible by authenticated user
   *
   * Since this store module is used in annotator mode, the expected response is
   * a list of datasets the authenticator user is dataset annotator in.
   */
  async loadDatasets ({ commit }) {
    let response
    try {
      response = await api.get('/datasets')
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.DATASETS_LOAD)
    }

    commit('SET_DATASETS', response.data)

    return response
  },

  /**
   * Load all workflows accessible by the current user.
   *
   * Since this store module is used in annotator mode, the expected response is
   * a list of workflows the user is an annotator in.
   */
  async loadWorkflows ({ commit }, { teamSlug }) {
    const response = await loadV2Workflows({ teamSlug })

    if ('data' in response) {
      response.data
        .map((workflow) => {
          const _workflow = workflow

          // mock model status
          const mockArray = ['active', 'draft', 'inactive']
          const randomIndex = Math.floor(Math.random() * mockArray.length)
          _workflow.status = mockArray[randomIndex]

          return _workflow
        })
      commit('SET_WORKFLOWS', response.data)
    }

    return response
  },

  /**
   * Loads details for a specific datasets.
   *
   * The details include the
   * "instructions" field as well as a list of annotation classes, both of which
   * are needed to render dataset instructions in annotator mode.
   *
   * @param {Object} dataset
   * The dataset to load the details for. Should contain at least an id key.
   */
  async loadDataset ({ commit }, dataset: DatasetPayload) {
    let response

    try {
      response = await api.get(`/datasets/${dataset.id}`)
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.DATASET_LOAD)
    }

    commit('PUSH_DATASET', response.data)

    return response
  }
}

const mutations: MutationTree<AnnotatorState> = {
  SET_DATASETS (state, data: DatasetPayload[]) {
    // replace semi-non-destructively
    // state will contain only datasets contained in the payload
    // however, if datasets already existed in state, expanded fields should stay
    state.datasets = data.map(d => {
      const matched = state.datasets.find(p => p.id === d.id)
      return matched ? { ...matched, ...d } : d
    })
  },

  PUSH_DATASET (state, dataset: DatasetPayload) {
    const index = state.datasets.findIndex(p => p.id === dataset.id)

    if (index > -1) {
      state.datasets.splice(index, 1, dataset)
    } else {
      state.datasets.push(dataset)
    }
  },

  SET_ITEMS (state, items: DatasetItemPayload[]) {
    state.items = items
  },

  REMOVE_ITEMS_FOR_DATASET (state, datasetId: number) {
    state.items = state.items.filter(i => i.dataset_id !== datasetId)
  },

  PUSH_ITEMS (state, items: DatasetItemPayload[]) {
    // when annotator requests work, they might get items already in the store, so in that case
    // we "replace" items that are already in the store by matching against new ides
    const newIds = items.map(s => s.id)
    state.items = [
      ...state.items.filter(s => !newIds.includes(s.id)),
      ...items
    ]
  },

  SET_WORKFLOWS (state, data: V2WorkflowPayload[]) {
    state.workflows = data
  },

  RESET_ALL (state) {
    copyAttributes(state, getInitialState())
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}
