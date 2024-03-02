import { Module, ActionTree, MutationTree, GetterTree } from 'vuex'

import {
  AnnotationClassPayload,
  DatasetItemPayload,
  DatasetPayload,
  RootState,
  V2DatasetItemPayload
} from '@/store/types'
import { api, parseError, errorMessages, copyAttributes, isErrorResponse } from '@/utils'
import {
  RunningSessionPayload,
  ModelTemplatePayload,
  TrainedModelPayload,
  TrainingSessionPayload,
  InferenceRequestCountPayload,
  RunningSessionInstanceCountPayload,
  ModelType,
  MetricsPayload
} from '@/utils/wind/types'

import { deployModel } from './actions/deployModel'
import { getMetrics } from './actions/getMetrics'
import { getTrainedModel } from './actions/getTrainedModel'
import { joinChannel } from './actions/joinChannel'
import { leaveChannel } from './actions/leaveChannel'
import { loadInferenceRequests } from './actions/loadInferenceRequests'
import { loadNewModelClassCounts } from './actions/loadNewModelClassCounts'
import { loadNewModelDatasetClasses } from './actions/loadNewModelDatasetClasses'
import { loadNewModelTrainingCounts } from './actions/loadNewModelTrainingCounts'
import { loadPublishedModelTemplates } from './actions/loadPublishedModelTemplates'
import { loadRunningSessionInstanceCounts } from './actions/loadRunningSessionInstanceCounts'
import { loadRunningSessions } from './actions/loadRunningSessions'
import { loadSampleDatasetItems } from './actions/loadSampleDatasetItems'
import { loadTrainedModels } from './actions/loadTrainedModels'
import { loadTrainingSessions } from './actions/loadTrainingSessions'
import { runInference } from './actions/runInference'
import { stopTrainingSession } from './actions/stopTrainingSession'
import { trainModel } from './actions/trainModel'
import { undeployModel } from './actions/undeployModel'
import { updateModel } from './actions/updateModel'
import { SET_NEW_MODEL_CLASS_COUNTS } from './mutations/SET_NEW_MODEL_CLASS_COUNTS'
import { SET_NEW_MODEL_TRAINING_COUNTS } from './mutations/SET_NEW_MODEL_TRAINING_COUNTS'
import { SET_NEW_MODEL_TRAINING_COUNTS_V2 } from './mutations/SET_NEW_MODEL_TRAINING_COUNTS_V2'
import { getInitialState } from './state'
import { NeuralModelMutation, NeuralModelState, TierData, TypeData } from './types'
import { validateNewModel } from './utils'

export { getInitialState }

const state: NeuralModelState = getInitialState()

const getters: GetterTree<NeuralModelState, RootState> = {}

const actions: ActionTree<NeuralModelState, RootState> = {
  deployModel,
  getMetrics,
  getTrainedModel,
  joinChannel,
  leaveChannel,
  loadInferenceRequests,
  loadNewModelClassCounts,
  loadNewModelDatasetClasses,
  loadNewModelTrainingCounts,
  loadPublishedModelTemplates,
  loadRunningSessionInstanceCounts,
  loadRunningSessions,
  loadSampleDatasetItems,
  loadTrainedModels,
  loadTrainingSessions,
  runInference,
  stopTrainingSession,
  trainModel,
  undeployModel,
  updateModel,

  async getTiers (store) {
    let response
    try {
      response = await api.get('/neural_models/tiers')
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.NEURAL_MODEL_DATA)
    }

    store.commit('SET_TIERS', response.data)

    return response
  },

  async getTypes (store) {
    let response
    try {
      response = await api.get('/neural_models/types')
    } catch (error: unknown) {
      if (!isErrorResponse(error)) { throw error }
      return parseError(error, errorMessages.NEURAL_MODEL_DATA)
    }

    store.commit('SET_TYPES', response.data)

    return response
  }
}

const SET_RUNNING_SESSION_REQUEST_COUNTS: NeuralModelMutation<
  { runningSession: RunningSessionPayload, data: InferenceRequestCountPayload[] }
> = (state, { runningSession, data }) => {
  state.runningSessionRequestCounts = state.runningSessionRequestCounts
    .filter(r => r.running_session_id !== runningSession.id)
    .concat(data)
}

const SET_RUNNING_SESSION_INSTANCE_COUNTS: NeuralModelMutation<
  { runningSession: RunningSessionPayload, data: RunningSessionInstanceCountPayload[] }
> = (state, { runningSession, data }) => {
  state.runningSessionInstanceCounts = state.runningSessionInstanceCounts
    .filter(r => r.running_session_id !== runningSession.id)
    .concat(data)
}

const SET_NEW_MODEL_TYPE: NeuralModelMutation<ModelType> = (state, type) => {
  state.newModelType = type
}

const SET_NEW_MODEL_NAME: NeuralModelMutation<string> = (state, name) => {
  // strip newlines from name before commiting to store
  // wind doesn't really care about this, so not enforced from that end
  // but we face less render issues if we sanitize on frontend
  state.newModelName = name.replace(/(\r\n|\n|\r)/gm, '')
}

const SET_NEW_MODEL_TEMPLATE: NeuralModelMutation<ModelTemplatePayload> = (state, template) => {
  state.newModelTemplate = template
}

const SET_NEW_MODEL_SAMPLE_ITEMS_CURSOR: NeuralModelMutation<string | null> = (state, cursor) => {
  state.newModelSampleItemsCursor = cursor
}

const SET_NEW_MODEL_SELECTED_CLASSES: NeuralModelMutation<AnnotationClassPayload[]> = (
  state,
  classes
) => {
  SET_NEW_MODEL_TRAINING_COUNTS(state, null)
  state.newModelSelectedClassIds = classes.map(c => c.id)
}

const SET_NEW_MODEL_DATASET: NeuralModelMutation<DatasetPayload> = (state, dataset) => {
  if (
    // setting dataset after it was null
    (!state.newModelDataset && dataset) ||
    // setting from one dataset to another
    (state.newModelDataset && dataset && state.newModelDataset.id !== dataset.id)
  ) {
    state.newModelSampleItems = []
    SET_NEW_MODEL_SAMPLE_ITEMS_CURSOR(state, null)
    SET_NEW_MODEL_SELECTED_CLASSES(state, [])
    SET_NEW_MODEL_TRAINING_COUNTS(state, null)
  }

  state.newModelDataset = dataset
}

const SET_NEW_MODEL_ANNOTATION_CLASSES: NeuralModelMutation<AnnotationClassPayload[]> = (
  state, classes
) => {
  state.newModelAnnotationClasses = classes
}

const PUSH_NEW_MODEL_SAMPLE_ITEMS: NeuralModelMutation<DatasetItemPayload[]> = (state, items) => {
  const newIds = items.map(i => i.id)
  state.newModelSampleItems = state.newModelSampleItems
    .filter(i => !newIds.includes(i.id))
    .concat(items)
    .sort((a, b) => a.seq - b.seq)
}

const PUSH_NEW_MODEL_SAMPLE_ITEMS_V2: NeuralModelMutation<V2DatasetItemPayload[]> = (
  state,
  items
) => {
  const newIds = items.map(i => i.id)
  state.newModelSampleItemsV2 = state.newModelSampleItemsV2
    .filter(i => !newIds.includes(i.id))
    .concat(items)
}

const TOGGLE_NEW_MODEL_CLASS_SELECTION: NeuralModelMutation<AnnotationClassPayload> = (
  state,
  annotationClass
) => {
  const idx = state.newModelSelectedClassIds.indexOf(annotationClass.id)
  if (idx === -1) {
    state.newModelSelectedClassIds.push(annotationClass.id)
  } else {
    SET_NEW_MODEL_TRAINING_COUNTS(state, null)
    state.newModelSelectedClassIds.splice(idx, 1)
  }
}

const DESELECT_ALL_NEW_MODEL_CLASSES: NeuralModelMutation<void> = state => {
  SET_NEW_MODEL_TRAINING_COUNTS(state, null)
  SET_NEW_MODEL_SELECTED_CLASSES(state, [])
}

const VALIDATE_NEW_MODEL: NeuralModelMutation<void> = (state) => {
  const errors = validateNewModel(state)
  state.newModelValidationErrors = errors
}

const SET_NEW_MODEL_VALIDATION_ERRORS_FROM_BACKEND: NeuralModelMutation<Record<string, string>> = (
  state,
  backendErrors
) => {
  const errors: NeuralModelState['newModelValidationErrors'] = {}
  if (backendErrors.name) { errors.name = backendErrors.name }
  state.newModelValidationErrors = errors
}

const mutations: MutationTree<NeuralModelState> = {
  DESELECT_ALL_NEW_MODEL_CLASSES,
  PUSH_NEW_MODEL_SAMPLE_ITEMS,
  PUSH_NEW_MODEL_SAMPLE_ITEMS_V2,
  SET_NEW_MODEL_ANNOTATION_CLASSES,
  SET_NEW_MODEL_CLASS_COUNTS,
  SET_NEW_MODEL_DATASET,
  SET_NEW_MODEL_NAME,
  SET_NEW_MODEL_SAMPLE_ITEMS_CURSOR,
  SET_NEW_MODEL_SELECTED_CLASSES,
  SET_NEW_MODEL_TEMPLATE,
  SET_NEW_MODEL_TRAINING_COUNTS,
  SET_NEW_MODEL_TRAINING_COUNTS_V2,
  SET_NEW_MODEL_TYPE,
  SET_NEW_MODEL_VALIDATION_ERRORS_FROM_BACKEND,
  SET_RUNNING_SESSION_INSTANCE_COUNTS,
  SET_RUNNING_SESSION_REQUEST_COUNTS,
  TOGGLE_NEW_MODEL_CLASS_SELECTION,
  VALIDATE_NEW_MODEL,

  DELETE_TRAINING_SESSION (state, data: TrainingSessionPayload) {
    const index = state.trainingSessions.findIndex(s => s.id === data.id)
    if (index >= 0) {
      state.trainingSessions.splice(index, 1)
    }
  },

  PUSH_METRICS (state, data: MetricsPayload) {
    const trainingSessionId = data[0].training_session_id
    state.metrics = {
      ...state.metrics,
      [trainingSessionId]: data
    }
  },

  PUSH_TRAINED_MODEL (state, data: TrainedModelPayload) {
    const index = state.trainedModels.findIndex(s => s.id === data.id)
    if (index >= 0) {
      state.trainedModels.splice(index, 1, data)
    } else {
      state.trainedModels.push(data)
    }
  },

  PUSH_TRAINING_SESSION (state, data: TrainingSessionPayload) {
    const index = state.trainingSessions.findIndex(s => s.id === data.id)
    if (index >= 0) {
      state.trainingSessions.splice(index, 1, data)
    } else {
      state.trainingSessions.push(data)
    }
  },

  PUSH_RUNNING_SESSION (state, data: RunningSessionPayload) {
    const index = state.runningSessions.findIndex(s => s.id === data.id)
    if (index >= 0) {
      state.runningSessions.splice(index, 1, data)
    } else {
      state.runningSessions.push(data)
    }
  },

  SET_TRAINED_MODELS (state, data: TrainedModelPayload[]) {
    state.trainedModels = data
  },

  SET_TRAINING_SESSIONS (state, data: TrainingSessionPayload[]) {
    state.trainingSessions = data
  },

  SET_RUNNING_SESSIONS (state, data: RunningSessionPayload[]) {
    state.runningSessions = data
  },

  SET_MODEL_TEMPLATES (state, data: ModelTemplatePayload[]) {
    state.modelTemplates = data
  },

  SET_TIERS (state, data: TierData[]) {
    state.tiers = data
  },

  SET_TYPES (state, data: TypeData[]) {
    state.types = data
  },

  SELECT_RUNNING_SESSION (state, data: RunningSessionPayload | null) {
    state.selectedRunningSession = data
  },

  SELECT_TRAINED_MODEL (state, data: TrainedModelPayload | null) {
    state.selectedTrainedModel = data
  },

  RESET_ALL (state: NeuralModelState) {
    copyAttributes(state, getInitialState())
  }
}

const neuralModel: Module<NeuralModelState, RootState> = {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}

export default neuralModel
