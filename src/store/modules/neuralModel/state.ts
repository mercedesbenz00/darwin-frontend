import { ModelType } from '@/utils/wind/types'

import { NeuralModelState } from './types'

export const getInitialState = (): NeuralModelState => ({
  metrics: {},
  modelTemplates: [],
  newModelAnnotationClasses: [],
  newModelClassCounts: null,
  newModelDataset: null,
  newModelName: '',
  newModelSampleItems: [],
  newModelSampleItemsV2: [],
  newModelSampleItemsCursor: null,
  newModelSelectedClassIds: [],
  newModelTemplate: null,
  newModelTrainingCounts: null,
  newModelType: ModelType.InstanceSegmentation,
  newModelValidationErrors: {},
  runningSessionInstanceCounts: [],
  runningSessionRequestCounts: [],
  runningSessions: [],
  selectedRunningSession: null,
  selectedTrainedModel: null,
  tiers: [],
  topic: null,
  trainedModels: [],
  trainingSessions: [],
  types: []
})
