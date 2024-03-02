import { InferenceResult } from '@/engineCommon/backend'
import { ModelDevice } from '@/store/modules/neuralModel/types'
import { ApiResponse } from '@/store/types'
import { AnnotationTypeName } from '@/store/types/AnnotationTypeName'
import { ParsedError } from '@/utils/error'

type RunningSessionAccessLevel =
  'private' |
  'protected' |
  'public'

export type TrainingClass = {
  /* eslint-disable camelcase */
  darwin_id?: number
  display_name?: string
  id: string
  name: string
  type: AnnotationTypeName
  subs: AnnotationTypeName[]
  /* eslint-enable camelcase */
}

export type RunningSessionPayload = {
  /* eslint-disable camelcase */
  access_level: RunningSessionAccessLevel
  auto_start: boolean
  auto_stop: boolean
  device: ModelDevice
  id: string
  inserted_at: string
  max: number
  meta: {
    classes: TrainingClass[]
    num_instances_available: number
    num_instances_starting: number
  }
  min: number
  name: string
  public: boolean
  team_id: number
  trained_model_id: string
  updated_at: string
  /* eslint-enable camelcase */
}

export type RunningSessionExpand =
  'meta.classes' |
  'meta.num_instances_available' |
  'meta.num_instances_starting'

export enum ModelType {
  AutoAnnotation = 'auto_annotate',
  InstanceSegmentation = 'instance_segmentation',
  SemanticSegmentation = 'semantic_segmentation',
  ObjectDetection = 'object_detection',
  Classification = 'classification',
  TextScanner = 'text_scanner'
}

export type ModelTemplatePayload = {
  /* eslint-disable camelcase */
  devices: ModelDevice[]
  docker_image: string
  id: string
  infer_params: object
  inserted_at: string
  load_params: object
  name: string
  train_params: object
  type: ModelType
  updated_at: string
  /* eslint-enable camelcase */
}

export type GustStatus =
  'available' |
  'initiating' |
  'loading' |
  'scheduled' |
  'starting' |
  'stopped' |
  'stopping'

export type RunningSessionInstanceCountPayload = {
  /* eslint-disable camelcase */
  [k in GustStatus]: number
} & {
  reported_for: string
  running_session_id: RunningSessionPayload['id']
  /* eslint-enable camelcase */
}

export type Gust = {
  /* eslint-disable camelcase */
  current_running_session_id: null
  id: string
  mode: 'train'
  status: GustStatus
  /* eslint-enable camelcase */
}

export type TrainingSessionPayload = {
  /* eslint-disable camelcase */
  dataset_id: number
  dataset_identifier: string
  dataset_version: number
  device: ModelDevice
  gust: Gust
  id: string
  model_template: ModelTemplatePayload
  name: string
  inserted_at: string
  status: string
  team_id: number
  trained_model_id: string | null
  training_stats: TrainingStatsPayload | null
  training_time_secs: number
  /* eslint-enable camelcase */
}

type TrainingStatsPayload = {
  /* eslint-disable camelcase */
  train: TrainingSplitStatsPayload
  val: TrainingSplitStatsPayload
  test: TrainingSplitStatsPayload
  max_density: number
  split_seed: number
  /* eslint-enable camelcase */
}

type TrainingSplitStatsPayload = {
  /* eslint-disable camelcase */
  class_distribution: { [class_name: string]: number }
  frame_count: number
  instance_distribution: { [class_name: string]: number }
  item_count: number
  split_percentage: number
  /* eslint-enable camelcase */
}

export type TrainedModelPayload = {
  /* eslint-disable camelcase */
  classes: TrainingClass[]
  id: string
  inserted_at: string
  model_template: ModelTemplatePayload
  name: string
  team_id: number | null
  training_result: any
  weights_key: string
  /* eslint-enable camelcase */
}

export type ModelPayload =
  TrainedModelPayload |
  TrainingSessionPayload |
  RunningSessionPayload

export type WindResponse<T=any> = Promise<ApiResponse<T> | ParsedError>
export type RunInferenceResponse<T=InferenceResult> = { result: T }

export type InferenceRequestCountPayload = {
  /* eslint-disable camelcase */
  request_count: number
  success_count: number
  failure_count: number
  date: string
  running_session_id: string
  /* eslint-enable camelcase */
}

type MetricData = { x: number, y: number }[]

export type MetricPayload = {
  /* eslint-disable camelcase */
  data: MetricData,
  name: string,
  training_session_id: string
  /* eslint-enable camelcase */
}

export type MetricsPayload = MetricPayload[]
