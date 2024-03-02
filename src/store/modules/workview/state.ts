import { PageRegistry } from '@/components/WorkView/BottomBar/pageRegistry'
import { loadBoolean, loadNumber } from '@/store/persistedSettings'
import {
  AnnotationTypeName,
  DatasetFolderPayload,
  DatasetItemCountsPayload,
  DatasetItemFilenamePayload,
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetItemsLoadingState,
  DatasetItemTimeSummaryPayload,
  DatasetPayload,
  LoadingStatus,
  RESET_ZOOM_MODE,
  PresetPayload,
  RunningSessionPayload,
  V2WorkflowStageInstancePayload,
  V2WorkflowItemStatePayload,
  V2WorkflowPayload,
  V2WorkflowStagePayload,
  WorkflowActionPayload,
  WorkflowStagePayload,
  WorkflowTemplatePayload,
  WorkflowStageTemplatePayload,
  V2DatasetItemPayload,
  V2DatasetItemTimeSummaryPayload
} from '@/store/types'
import { ParsedError } from '@/utils'
import {
  ANNOTATION_ITEM_DEFAULT_DURATION,
  HARDWARE_CONCURRENCY,
  SHOULD_RENDER_SUB_ANNOTATIONS
} from '@/utils/localStorageKeys'

import {
  ClassMapping,
  DatasetItemCursorMapping,
  LoadedImage,
  LoadedVideo,
  StageAnnotation
} from './types'

export type WorkviewState = {
  classMapping: { [runningSessionId: string]: ClassMapping }
  classSelectionIsOpen: boolean
  clickerEpsilon: number
  currentTool: null | string
  // eslint-disable-next-line camelcase
  dataset: DatasetPayload | null
  instructionsIsOpen: boolean
  isCopyingAnnotations: boolean
  autoAnnotateModels: RunningSessionPayload[]
  preselectedAnnotationClassId: null | number
  preselectedAnnotationClassIds: { [K: string]: number }
  preselectedModelId: null | string
  previousAnnotationClass: null | number
  renderAnnotations: boolean
  renderMobileButtons: boolean
  renderMeasures: boolean
  renderSubAnnotations: boolean
  sequences: number[]
  toolAnnotationTypes: AnnotationTypeName[]
  tutorialMode: boolean
  resetZoomMode: RESET_ZOOM_MODE
  videoAnnotationDuration: number
  annotationOverlayDisabled: boolean
  hardwareConcurrency: number,

  datasetFolders: DatasetFolderPayload[]
  datasetTreefiedFolders: DatasetFolderPayload[]
  datasetItemFilenames: DatasetItemFilenamePayload[]
  datasetItemCounts: DatasetItemCountsPayload | null
  datasetItemFilter: DatasetItemFilter
  datasetItemCursorMappings: DatasetItemCursorMapping[]
  datasetItemPageRegistry: PageRegistry
  datasetItems: DatasetItemPayload []
  datasetItemsLoading: DatasetItemsLoadingState
  datasetItemTimeSummaries: DatasetItemTimeSummaryPayload[]
  error: ParsedError['error'] | null
  loadedImages: LoadedImage[]
  loadedVideos: LoadedVideo[]
  scheduledStageAutoCompletions: [number, number][]
  selectedDatasetItem: DatasetItemPayload | null
  selectedDatasetItemV2Id: V2DatasetItemPayload['id'] | null
  selectedStageInstance: WorkflowStagePayload | null
  selectedStageTemplate: WorkflowStageTemplatePayload | null
  stageAnnotations: StageAnnotation[]
  workflowActions: { datasetItemId: number, actions: WorkflowActionPayload[] }[]
  workflowActionsLoading: LoadingStatus
  workflowTemplates: WorkflowTemplatePayload[]
  presets: PresetPayload[]
  activePresetId: number | null

  hiddenAuthorsMap: Record<string, boolean>
  hiddenClassesMap: Record<string, boolean>

  // workflows 2.0
  v2Workflows: V2WorkflowPayload[]
  v2WorkflowItemState: V2WorkflowItemStatePayload | null
  v2SelectedStageInstance: V2WorkflowStageInstancePayload | null
  v2SelectedStage: V2WorkflowStagePayload | null
  v2DatasetItemTimeSummaries: { [id: string]: V2DatasetItemTimeSummaryPayload }
}

export const getInitialState = (): WorkviewState => ({
  classSelectionIsOpen: false,
  clickerEpsilon: 0.5,
  currentTool: null,
  dataset: null,
  instructionsIsOpen: false,
  isCopyingAnnotations: false,
  autoAnnotateModels: [],
  classMapping: JSON.parse(localStorage.getItem('class-mapping') || '{}'),
  preselectedAnnotationClassId: null,
  preselectedAnnotationClassIds: {},
  preselectedModelId: null,
  previousAnnotationClass: null,
  renderAnnotations: true,
  renderMobileButtons: false,
  renderMeasures: false,
  renderSubAnnotations: loadBoolean(SHOULD_RENDER_SUB_ANNOTATIONS, true),
  annotationOverlayDisabled: false,

  sequences: [],
  toolAnnotationTypes: [],
  tutorialMode: false,
  resetZoomMode: RESET_ZOOM_MODE.RESET,
  videoAnnotationDuration: loadNumber(ANNOTATION_ITEM_DEFAULT_DURATION, 30),
  hardwareConcurrency: loadNumber(HARDWARE_CONCURRENCY, (navigator.hardwareConcurrency - 1) || 2),
  datasetFolders: [],
  datasetTreefiedFolders: [],
  datasetItemFilenames: [],
  datasetItemCounts: null,
  datasetItemFilter: {},
  datasetItemPageRegistry: { queue: [], requested: [] },
  datasetItemCursorMappings: [],
  datasetItems: [],
  datasetItemsLoading: DatasetItemsLoadingState.Unloaded,
  datasetItemTimeSummaries: [],
  error: null,
  loadedImages: [],
  loadedVideos: [],
  scheduledStageAutoCompletions: [],
  selectedDatasetItem: null,
  selectedDatasetItemV2Id: null,
  selectedStageInstance: null,
  selectedStageTemplate: null,
  stageAnnotations: [],
  workflowActions: [],
  workflowActionsLoading: LoadingStatus.Unloaded,
  workflowTemplates: [],
  presets: [],
  activePresetId: null,

  /**
   * In workview, the user can toggle visibility of annotations by class or by author.
   * To have this persist, we need to store ids of authors and classes that got hidden in the store,
   * separate from annotations themselves.
   *
   * This then allows us to filter out hidden annotations using store getters.
   */
  hiddenAuthorsMap: {},
  hiddenClassesMap: {},

  // workflows 2.0
  v2SelectedStage: null,
  v2SelectedStageInstance: null,
  v2WorkflowItemState: null,
  v2Workflows: [],
  v2DatasetItemTimeSummaries: {}
})

export const state: WorkviewState = getInitialState()
