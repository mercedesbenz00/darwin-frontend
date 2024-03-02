import {
  AnnotationClassPayload,
  DatasetItemPayload,
  DatasetPayload,
  DatasetReportPayload,
  RootState,
  TypedAction,
  TypedMutation,
  V2DatasetItemPayload
} from '@/store/types'
import {
  InferenceRequestCountPayload,
  MetricsPayload,
  ModelTemplatePayload,
  ModelType,
  RunningSessionInstanceCountPayload,
  RunningSessionPayload,
  TrainedModelPayload,
  TrainingSessionPayload
} from '@/utils/wind/types'

export type ModelTier = 'evaluation' | 'standard' | 'production'

type ModelInstance = {
  /* eslint-disable camelcase */
  mode: string,
  status: InstanceStatus,
  latest_updated_at: Date
  /* eslint-enable camelcase */
}

/**
 * Data for a model to be used on the frontend.
 *
 * Usually deserialized from `ModelPayload`
 */
export type Model = {
  datasetId: number
  id: string
  insertedAt: Date
  min?: number
  max?: number
  name: string
  status: ModelInstance[]
  teamId: number
  tier: ModelTier
  training: boolean
  type: ModelType
  updatedAt: Date
  url: string
}

/**
 * Data for a model, received from backend.
 *
 * Usually serialized into `Model` before being used.
 */
export type ModelPayload = {
  /* eslint-disable camelcase */
  dataset_id: number
  id: string
  inserted_at: string
  name: string
  min?: number,
  max?: number,
  status: ModelInstance[]
  team_id: number
  tier: ModelTier
  training: boolean
  type: ModelType
  updated_at: string
  url: string
  /* eslint-enable camelcase */
}

export type ModelEstimate = {
  cost: number
  hours: number
}

export type TierData = {
  description: string
  id: ModelTier
  name: string
}

export type TypeData = {
  /* eslint-disable camelcase */
  annotation_types: string[]
  characteristics: string[]
  description: string
  hero_video: null | string
  icon: string
  id: ModelType
  name: string
  /* eslint-enable camelcase */
}

export type ModelStatus = 'start' | 'starting' | 'stopping' | 'running' | 'training'

export type InstanceStatus = 'available' | 'starting' | 'loading'

export type NeuralModelAction<T, R = any> = TypedAction<NeuralModelState, RootState, T, R>
export type NeuralModelMutation<R = any> = TypedMutation<NeuralModelState, R>

export enum ModelDevice {
  CPU = 'cpu',
  GPU = 'gpu'
}

export type NeuralModelValidationErrors = {
  classes?: string
  dataset?: string
  items?: string
  name?: string
  template?: string
}

export type NeuralModelState = {
  metrics: Record<string, MetricsPayload>
  modelTemplates: ModelTemplatePayload[]
  runningSessionInstanceCounts: RunningSessionInstanceCountPayload[]
  runningSessionRequestCounts: InferenceRequestCountPayload[]
  runningSessions: RunningSessionPayload[]
  selectedRunningSession: RunningSessionPayload | null
  selectedTrainedModel: TrainedModelPayload | null
  tiers: TierData[]
  topic: null | string
  trainedModels: TrainedModelPayload[]
  trainingSessions: TrainingSessionPayload[]
  types: TypeData[]

  /**
   * Used during model creation.
   * Allows us to filter selectable model templates.
   */
  newModelType: ModelType

  /**
   * Used during model creation.
   * Name of the training session / trained model which will be created.
   */
  newModelName: string

  /**
   * Used during model creation.
   * Dataset the new model will be trained on.
   */
  newModelDataset: DatasetPayload | null

  /**
   * Used during model creation.
   *
   * Classes defined for the currently selected dataset. This will get reset to
   * [] every time `newModelDataset` is set.
   */
  newModelAnnotationClasses: AnnotationClassPayload[],

  /**
   * Subset of `newModelAnnotationClasses` ids selected for training of a new model
   */
  newModelSelectedClassIds: AnnotationClassPayload['id'][]

  /**
   * Used during model creation
   *
   * Small batch of sample items, loaded for currently selected dataset. This
   * will get reset to [] every time `newModelDataset` is set.
   */
  newModelSampleItems: DatasetItemPayload[]
  newModelSampleItemsV2: V2DatasetItemPayload[]

  /**
   * Used during model creation.
   *
   * Sample items are fetched one small batch at a time. This key holds the
   * cursor pointing at the next batch to be fetched. It will get reset every
   * time a different dataset is selected.
   */
  newModelSampleItemsCursor: string | null

  /**
   * Used during model creation.
   * Type of training new model will receive.
   */
  newModelTemplate: ModelTemplatePayload | null

  /**
   * Used to show training, validation and test set counts on the third step of
   * model creation.
   */
  newModelTrainingCounts: number | null,

  /**
   * Used to show class distribution of a selected dataset
   */
  newModelClassCounts: DatasetReportPayload | null

  /**
   * Used during new model creation as a way to render validation errors across
   * different steps of the creation flow.
   */
  newModelValidationErrors: NeuralModelValidationErrors
}
