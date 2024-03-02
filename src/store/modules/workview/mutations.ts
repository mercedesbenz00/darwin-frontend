import Vue from 'vue'

import { getWindowLevelsRange } from '@/engine/utils'
import { saveBoolean, saveNumber } from '@/store/persistedSettings'
import {
  DatasetFolderPayload,
  DatasetImagePayload,
  DatasetItemsLoadingState,
  LoadingStatus,
  RESET_ZOOM_MODE,
  RunningSessionPayload,
  WorkflowStagePayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload
} from '@/store/types'
import { copyAttributes, treeify } from '@/utils'
import {
  ANNOTATION_ITEM_DEFAULT_DURATION,
  HARDWARE_CONCURRENCY,
  SHOULD_RENDER_SUB_ANNOTATIONS
} from '@/utils/localStorageKeys'

import { ASSIGN_STAGE } from './mutations/ASSIGN_STAGE'
import { CLEAR_DATASET_ITEMS } from './mutations/CLEAR_DATASET_ITEMS'
import { CLEAR_DATASET_ITEM_PAGE_REGISTRY } from './mutations/CLEAR_DATASET_ITEM_PAGE_REGISTRY'
import { CLEAR_LOADED_VIDEO } from './mutations/CLEAR_LOADED_VIDEO'
import { CLEAR_STAGE_ANNOTATIONS } from './mutations/CLEAR_STAGE_ANNOTATIONS'
import { CLEAR_V2_AUTOCOMPLETE } from './mutations/CLEAR_V2_AUTOCOMPLETE'
import { DELETE_PRESET } from './mutations/DELETE_PRESET'
import { DESELECT_ALL_ANNOTATIONS } from './mutations/DESELECT_ALL_ANNOTATIONS'
import { DESELECT_ANNOTATION } from './mutations/DESELECT_ANNOTATION'
import { ENQUEUE_DATASET_ITEM_PAGE } from './mutations/ENQUEUE_DATASET_ITEM_PAGE'
import { HIDE_ANNOTATION } from './mutations/HIDE_ANNOTATION'
import { HIDE_ANNOTATIONS_BY_AUTHOR } from './mutations/HIDE_ANNOTATIONS_BY_AUTHOR'
import { HIDE_ANNOTATIONS_BY_CLASS } from './mutations/HIDE_ANNOTATIONS_BY_CLASS'
import { MERGE_DATASET_ITEM_PAGE_REGISTRY } from './mutations/MERGE_DATASET_ITEM_PAGE_REGISTRY'
import { PUSH_DATASET_ITEM } from './mutations/PUSH_DATASET_ITEM'
import { PUSH_DATASET_ITEMS } from './mutations/PUSH_DATASET_ITEMS'
import { PUSH_DATASET_ITEMS_AFTER } from './mutations/PUSH_DATASET_ITEMS_AFTER'
import { PUSH_DATASET_ITEMS_BEFORE } from './mutations/PUSH_DATASET_ITEMS_BEFORE'
import { PUSH_LOADED_VIDEO } from './mutations/PUSH_LOADED_VIDEO'
import { PUSH_PRESET } from './mutations/PUSH_PRESET'
import { PUSH_STAGE } from './mutations/PUSH_STAGE'
import { PUSH_TIME_SUMMARY } from './mutations/PUSH_TIME_SUMMARY'
import { PUSH_V2_TIME_SUMMARY } from './mutations/PUSH_V2_TIME_SUMMARY'
import { PUSH_V2_WORKFLOW_ITEM } from './mutations/PUSH_V2_WORKFLOW_ITEM'
import { PUSH_VIDEO_FRAMES } from './mutations/PUSH_VIDEO_FRAMES'
import {
  RESOLVE_UNRESOLVED_PAGE_REGISTRY_QUEUE
} from './mutations/RESOLVE_UNRESOLVED_PAGE_REGISTRY_QUEUE'
import { SELECT_ANNOTATION } from './mutations/SELECT_ANNOTATION'
import { SET_ACTIVE_MANIPULATION_PRESET_ID } from './mutations/SET_ACTIVE_MANIPULATION_PRESET_ID'
import { SET_ANNOTATION_OVERLAY_DISABLED } from './mutations/SET_ANNOTATION_OVERLAY_DISABLED'
import { SET_AUTO_ANNOTATE_CLASS_MAPPING } from './mutations/SET_AUTO_ANNOTATE_CLASS_MAPPING'
import { SET_DATASET_ITEMS_FILTER } from './mutations/SET_DATASET_ITEMS_FILTER'
import { SET_DATASET_ITEM_COUNTS } from './mutations/SET_DATASET_ITEM_COUNTS'
import { SET_DATASET_ITEM_FILENAMES } from './mutations/SET_DATASET_ITEM_FILENAMES'
import { SET_ERROR } from './mutations/SET_ERROR'
import { SET_LOADED_VIDEO_FRAME_LOADED } from './mutations/SET_LOADED_VIDEO_FRAME_LOADED'
import { SET_PRESETS } from './mutations/SET_PRESETS'
import {
  SET_SELECTED_DATASET_ITEM,
  SET_V2_SELECTED_DATASET_ITEM
} from './mutations/SET_SELECTED_DATASET_ITEM'
import { SET_STAGE_ANNOTATIONS } from './mutations/SET_STAGE_ANNOTATIONS'
import { SET_TOOL_ANNOTATION_TYPES } from './mutations/SET_TOOL_ANNOTATION_TYPES'
import { SET_V2_AUTOCOMPLETE } from './mutations/SET_V2_AUTOCOMPLETE'
import { SET_V2_SELECTED_STAGE } from './mutations/SET_V2_SELECTED_STAGE'
import { SET_V2_SELECTED_STAGE_INSTANCE } from './mutations/SET_V2_SELECTED_STAGE_INSTANCE'
import { SET_V2_WORKFLOWS } from './mutations/SET_V2_WORKFLOWS'
import { SET_V2_WORKFLOW_ITEM_STATE } from './mutations/SET_V2_WORKFLOW_ITEM_STATE'
import { SET_WORKFLOW_ACTIONS } from './mutations/SET_WORKFLOW_ACTIONS'
import { SHOW_ANNOTATION } from './mutations/SHOW_ANNOTATION'
import { SHOW_ANNOTATIONS_BY_AUTHOR } from './mutations/SHOW_ANNOTATIONS_BY_AUTHOR'
import { SHOW_ANNOTATIONS_BY_CLASS } from './mutations/SHOW_ANNOTATIONS_BY_CLASS'
import { TOGGLE_MEASURES } from './mutations/TOGGLE_MEASURES'
import { UNHIGHLIGHT_ALL_ANNOTATIONS } from './mutations/UNHIGHLIGHT_ALL_ANNOTATIONS'
import { UNSHIFT_DATASET_ITEMS } from './mutations/UNSHIFT_DATASET_ITEMS'
import { UPDATE_ANNOTATIONS_VISIBILITY } from './mutations/UPDATE_ANNOTATIONS_VISIBILITY'
import { UPDATE_DATASET_ITEMS } from './mutations/UPDATE_DATASET_ITEMS'
import { getInitialState, WorkviewState } from './state'
import {
  DatasetItemCursorMapping,
  LoadedImage,
  StageAnnotation,
  UpdateStageAnnotationPayload,
  WorkflowMutation
} from './types'
import {
  compareByZIndex,
  deselectOtherAnnotations,
  matchAnnotation,
  shiftZIndices
} from './utils'

export const mutations: { [k: string]: WorkflowMutation } = {
  SET_SELECTED_DATASET_ITEM,
  SET_V2_SELECTED_DATASET_ITEM,

  // instructions
  CLOSE_INSTRUCTIONS (state) {
    state.instructionsIsOpen = false
  },

  OPEN_INSTRUCTIONS (state) {
    state.instructionsIsOpen = true
  },

  // copy

  SET_COPYING_ANNOTATIONS (state, isCopying) {
    state.isCopyingAnnotations = isCopying
  },

  // tools

  SET_CURRENT_TOOL (state, toolName = null) {
    if (toolName === state.currentTool) { return }
    state.currentTool = toolName

    state.preselectedAnnotationClassId = state.preselectedAnnotationClassIds[toolName] || null
  },

  PRESELECT_CLASS_ID (state, preselectedClassId = null) {
    state.preselectedAnnotationClassId = preselectedClassId
  },

  // This is pretty same as PRESELECT_CLASS_ID
  // The reason why we have the same mutation is to prevent
  // the editor to select the proper tool automatically
  PRESELECT_CLASS_ID_WITHOUT_TOOL_CHANGE (state, preselectedClassId = null) {
    state.preselectedAnnotationClassId = preselectedClassId
  },

  PRESELECT_CLASS_ID_FOR_TOOL (state, { classId, tool }: { classId: number, tool: string }) {
    Vue.set(state.preselectedAnnotationClassIds, tool, classId)
  },

  SET_CURRENT_TOOL_PRESELECTED_MODEL_ID (state, preselectedModelId = null) {
    state.preselectedModelId = preselectedModelId
  },

  SET_TOOL_ANNOTATION_TYPES,

  // classes

  SET_DATASET (state, data: WorkviewState['dataset']) {
    state.dataset = data
  },

  SET_SEQUENCES (state, data: number[]) {
    state.sequences = data
  },

  SET_AUTO_ANNOTATE_MODELS (state, data: RunningSessionPayload[]) {
    state.autoAnnotateModels = data
  },

  // presets
  SET_ACTIVE_MANIPULATION_PRESET_ID,
  SET_PRESETS,
  PUSH_PRESET,
  DELETE_PRESET,
  // annotation selection/visibility/highlight

  TOGGLE_ANNOTATION_SELECTION (state, data: StageAnnotation) {
    data.isSelected = !data.isSelected
    deselectOtherAnnotations(state, data)
  },

  SELECT_ANNOTATION,
  DESELECT_ANNOTATION,
  DESELECT_ALL_ANNOTATIONS,
  SHOW_ANNOTATION,
  HIDE_ANNOTATION,

  TOGGLE_ANNOTATION_VISIBILITY (state, data: StageAnnotation) {
    data.isVisible = !data.isVisible
  },

  UPDATE_ANNOTATIONS_VISIBILITY,

  HIGHLIGHT_ANNOTATION (state, id: string) {
    const annotation = matchAnnotation(state, id)
    if (!annotation || annotation.isHighlighted) { return }
    UNHIGHLIGHT_ALL_ANNOTATIONS(state)
    annotation.isHighlighted = true
  },

  UNHIGHLIGHT_ANNOTATION (state, id: string) {
    const annotation = matchAnnotation(state, id)
    if (!annotation || !annotation.isHighlighted) { return }
    annotation.isHighlighted = false
  },

  TOGGLE_MEASURES,
  UNHIGHLIGHT_ALL_ANNOTATIONS,

  // tutorial

  SET_TUTORIAL_MODE (state, enableTutorialMode: boolean) {
    state.tutorialMode = enableTutorialMode
  },

  RESET_ALL (state) {
    copyAttributes(state, getInitialState())
  },

  SET_RESET_ZOOM_MODE (state, resetZoomMode: RESET_ZOOM_MODE) {
    state.resetZoomMode = resetZoomMode
  },

  TOGGLE_ANNOTATIONS (state) {
    state.renderAnnotations = !state.renderAnnotations
    state.stageAnnotations =
  state.stageAnnotations.map(a => ({ ...a, isVisible: state.renderAnnotations }))
  },

  TOGGLE_SUBANNOTATIONS (state) {
    state.renderSubAnnotations = !state.renderSubAnnotations
    saveBoolean(SHOULD_RENDER_SUB_ANNOTATIONS, state.renderSubAnnotations)
  },

  SHOW_SUBANNOTATIONS (state) {
    state.renderSubAnnotations = true
  },

  SET_ANNOTATION_OVERLAY_DISABLED,

  SET_DATASET_FOLDERS (state, params: { folders: DatasetFolderPayload[], datasetId: number }) {
    const { folders, datasetId } = params
    const filteredFolders = folders.filter(folder => folder.direct_item_count_filtered > 0)
    state.datasetFolders = filteredFolders
    state.datasetTreefiedFolders = treeify(filteredFolders, datasetId)
  },

  PUSH_DATASET_ITEM,
  PUSH_DATASET_ITEMS,
  UNSHIFT_DATASET_ITEMS,
  UPDATE_DATASET_ITEMS,
  PUSH_DATASET_ITEMS_AFTER,
  PUSH_DATASET_ITEMS_BEFORE,

  SET_DATASET_ITEMS_LOADING (state, loading: DatasetItemsLoadingState) {
    state.datasetItemsLoading = loading
  },

  SET_DATASET_ITEMS_FILTER,
  SET_DATASET_ITEM_COUNTS,
  SET_DATASET_ITEM_FILENAMES,
  CLEAR_DATASET_ITEMS,
  CLEAR_DATASET_ITEM_PAGE_REGISTRY,
  RESOLVE_UNRESOLVED_PAGE_REGISTRY_QUEUE,
  ENQUEUE_DATASET_ITEM_PAGE,
  MERGE_DATASET_ITEM_PAGE_REGISTRY,

  PUSH_DATASET_ITEM_CURSOR_MAPPING (state, cursorMapping: DatasetItemCursorMapping) {
    state.datasetItemCursorMappings.push(cursorMapping)
  },

  UNSHIFT_DATASET_ITEM_CURSOR_MAPPING (state, cursorMapping: DatasetItemCursorMapping) {
    state.datasetItemCursorMappings.unshift(cursorMapping)
  },

  PUSH_DATASET_ITEM_CURSOR_MAPPING_AFTER (
    state,
    params: { cursorMapping: DatasetItemCursorMapping, index: number }
  ) {
    const { cursorMapping, index } = params
    if (index === state.datasetItemCursorMappings.length - 1) {
      state.datasetItemCursorMappings.push(cursorMapping)
    } else {
      state.datasetItemCursorMappings.splice(index + 1, 0, cursorMapping)
    }
  },

  PUSH_DATASET_ITEM_CURSOR_MAPPING_BEFORE (
    state,
    params: { cursorMapping: DatasetItemCursorMapping, index: number }
  ) {
    const { cursorMapping, index } = params
    state.datasetItemCursorMappings.splice(index, 0, cursorMapping)
  },

  RESET_DATASET_ITEM_CURSOR_MAPPING (state) {
    state.datasetItemCursorMappings = []
  },

  SET_SELECTED_STAGE_INSTANCE (state, data: WorkflowStagePayload) {
    state.selectedStageInstance = data
  },

  SET_SELECTED_STAGE_TEMPLATE (state, data: WorkflowStageTemplatePayload) {
    state.selectedStageTemplate = data
  },

  PUSH_LOADED_IMAGE (state, data: { payload: DatasetImagePayload, image: HTMLImageElement }) {
    const image: LoadedImage = {
      id: data.payload.image.id,
      datasetImageId: data.payload.id,
      taskId: null,
      url: data.payload.image.url,
      thumbnailURL: data.payload.image.thumbnail_url,
      originalFilename: data.payload.image.original_filename,
      width: data.payload.image.width,
      height: data.payload.image.height,
      data: {
        data: data.image,
        rawData: null,
        transformedData: null,
        lastWindowLevels: getWindowLevelsRange(),
        lastColorMap: 'default'
      },
      format: data.payload.image.format,
      levels: data.payload.image.levels
    }

    state.loadedImages.push(image)
  },

  RESET_LOADED_IMAGE (state) {
    state.loadedImages.forEach((image) => {
      if (!image.data) { return }
      image.data.data.remove()
    })
    state.loadedImages = []
  },

  PUSH_LOADED_VIDEO,
  PUSH_VIDEO_FRAMES,
  CLEAR_LOADED_VIDEO,
  SET_LOADED_VIDEO_FRAME_LOADED,
  SET_STAGE_ANNOTATIONS,
  CLEAR_STAGE_ANNOTATIONS,

  /**
   * Push a new (persisted or unpersisted) annotation into the store
   */
  PUSH_STAGE_ANNOTATION (state, data: StageAnnotation) {
    // since we have cases where we push a locally created (by the editor), object
    // we need to make sure to make a clone here, to avoid mutating outside of store
    // once the editor delegates all actions on this object to the store, we can avoid this
    const annotation = { ...data }
    if (annotation.isSelected) { deselectOtherAnnotations(state, annotation) }
    state.stageAnnotations.push(annotation)
  },

  /**
   * Push new (persisted or unpersisted) annotations into the store
   */
  PUSH_STAGE_ANNOTATIONS (state, data: StageAnnotation[]) {
    // since we push locally created annotations,
    // we are just pushing annotations
    state.stageAnnotations.push(...data)
  },

  /**
   * Update unpersised or persised annotation with data from backend
   *
   * If unpersisted, this also sets the id
   */
  UPDATE_STAGE_ANNOTATION (state: WorkviewState, payload: UpdateStageAnnotationPayload) {
    const { annotation, data } = payload

    // ensure annotation is in state
    const index = state.stageAnnotations
      .sort(compareByZIndex)
      .findIndex(a => a.id === annotation.id)
    if (index === -1) { return }

    const matched = state.stageAnnotations[index]

    // store old z_index to shift other annotations
    const { z_index: oldZindex } = matched

    // update data
    // This mutation is being watched and subscribed by engine/manager/annotationManager
    // If new mutate action is added here, we need to update it as well.
    state.stageAnnotations.splice(index, 1, {
      ...matched,
      annotation_class_id: data.annotation_class_id,
      data: data.data,
      actors: data.actors,
      id: data.id,
      workflow_stage_id: data.workflow_stage_id,
      z_index: data.z_index
    })

    // shift other annotations to make room in case this one moved
    state.stageAnnotations = shiftZIndices(
      [...state.stageAnnotations].sort(compareByZIndex),
      state.stageAnnotations[index],
      oldZindex as number
    )
  },

  /** Remove a stage annotation from store */
  REMOVE_STAGE_ANNOTATION (state, data: StageAnnotation) {
    state.stageAnnotations = state.stageAnnotations.filter(a => a.id !== data.id)
  },

  /** Remove stage annotations from store */
  REMOVE_STAGE_ANNOTATIONS (state, data: StageAnnotation[]) {
    const ids = data.map(a => a.id)
    state.stageAnnotations = state.stageAnnotations.filter(a => !ids.includes(a.id))
  },

  /** Push a workflow template into the store */
  PUSH_WORKFLOW_TEMPLATE (state, data: WorkflowTemplatePayload) {
    const index = state.workflowTemplates.findIndex(i => i.id === data.id)
    if (index === -1) {
      state.workflowTemplates.push(data)
    } else {
      state.workflowTemplates.splice(index, 1, data)
    }
  },

  ASSIGN_STAGE,

  /**
   * Mark a workflow stage as complete.
   *
   * This also includes rejection of stages in review.
   * Also advances or regresses a workflow, depending on the outcome of the stage.
   */
  COMPLETE_STAGE (state, data: WorkflowStagePayload) {
    data.completed = true
    data.completes_at = null
  },

  PUSH_STAGE,
  PUSH_TIME_SUMMARY,
  PUSH_V2_TIME_SUMMARY,

  SCHEDULE_STAGE_AUTO_COMPLETE (state, payload: [number, number]) {
    state.scheduledStageAutoCompletions.push(payload)
  },

  CANCEL_STAGE_AUTO_COMPLETE (state, data: WorkflowStagePayload) {
    state.scheduledStageAutoCompletions
      .filter(s => s[0] === data.id)
      .forEach(s => window.clearTimeout(s[1]))

    state.scheduledStageAutoCompletions =
      state.scheduledStageAutoCompletions.filter(s => s[0] !== data.id)
  },

  SET_ERROR,
  SET_WORKFLOW_ACTIONS,

  SET_WORKFLOW_ACTIONS_LOADING (state, loadingStatus: LoadingStatus) {
    state.workflowActionsLoading = loadingStatus
  },

  SET_CLICKER_EPSILON (state, epsilon: number) {
    state.clickerEpsilon = epsilon
  },

  SET_VIDEO_ANNOTATION_DURATION (state, duration: number) {
    saveNumber(ANNOTATION_ITEM_DEFAULT_DURATION, duration)
    state.videoAnnotationDuration = duration
  },

  SET_HARDWARE_CONCURRENCY (state, hardwareConcurrency: number) {
    saveNumber(HARDWARE_CONCURRENCY, hardwareConcurrency)
    state.hardwareConcurrency = hardwareConcurrency
  },

  HIDE_ANNOTATIONS_BY_AUTHOR,
  SHOW_ANNOTATIONS_BY_AUTHOR,
  HIDE_ANNOTATIONS_BY_CLASS,
  SHOW_ANNOTATIONS_BY_CLASS,

  SHOW_MOBILE_BUTTONS (state) {
    state.renderMobileButtons = true
  },

  SET_AUTO_ANNOTATE_CLASS_MAPPING,

  CLEAR_V2_AUTOCOMPLETE,
  PUSH_V2_WORKFLOW_ITEM,
  SET_V2_AUTOCOMPLETE,
  SET_V2_SELECTED_STAGE_INSTANCE,
  SET_V2_SELECTED_STAGE,
  SET_V2_WORKFLOW_ITEM_STATE,
  SET_V2_WORKFLOWS
}
