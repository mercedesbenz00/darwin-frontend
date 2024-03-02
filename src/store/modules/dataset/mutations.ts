import Vue from 'vue'
import { MutationTree } from 'vuex'

import { VIEW_MODE } from '@/components/Common/Gallery/types'
import { Poller } from '@/store/modules/dataset/types'
import { saveBoolean } from '@/store/persistedSettings'
import {
  DatasetDetailPayload,
  DatasetItemCountsPayload,
  DatasetItemFilter,
  DatasetItemPayload,
  DatasetPayload,
  WorkflowStageTemplatePayload,
  WorkflowTemplatePayload,
  V2DatasetItemFilter,
  V2DatasetItemPayload
} from '@/store/types'
import { copyAttributes } from '@/utils'
import { WORKFLOW_FOLDER_ENABLED } from '@/utils/localStorageKeys'

import { ARCHIVE_SELECTED_DATASET_ITEMS } from './mutations/ARCHIVE_SELECTED_DATASET_ITEMS'
import { ASSIGN_SELECTED_ITEMS } from './mutations/ASSIGN_SELECTED_ITEMS'
import { MOVE_SELECTED_ITEMS_TO_PATH } from './mutations/MOVE_SELECTED_ITEMS_TO_PATH'
import { PUSH_DATASET_ITEMS } from './mutations/PUSH_DATASET_ITEMS'
import { PUSH_WORKFORCE_MANAGERS } from './mutations/PUSH_WORKFORCE_MANAGERS'
import { REMOVE_DATASET_ITEMS_BY_IDS } from './mutations/REMOVE_DATASET_ITEMS_BY_IDS'
import { REMOVE_SELECTED_DATASET_ITEMS } from './mutations/REMOVE_SELECTED_DATASET_ITEMS'
import { RESTORE_SELECTED_DATASET_ITEMS } from './mutations/RESTORE_SELECTED_DATASET_ITEMS'
import { SET_DATASET_FOLDERS } from './mutations/SET_DATASET_FOLDERS'
import { SET_DATASET_ITEM_FILENAMES } from './mutations/SET_DATASET_ITEM_FILENAMES'
import { SET_EXPORT_COMPLETE_COUNT } from './mutations/SET_EXPORT_COMPLETE_COUNT'
import { SET_ITEM_STATUS } from './mutations/SET_ITEM_STATUS'
import { SET_SELECTED_ALL_ITEMS } from './mutations/SET_SELECTED_ALL_ITEMS'
import { SET_SELECTED_ITEMS } from './mutations/SET_SELECTED_ITEMS'
import { SET_SELECTED_ITEMS_PRIORITY } from './mutations/SET_SELECTED_ITEMS_PRIORITY'
import { SET_STAGE_NUMBER } from './mutations/SET_STAGE_NUMBER'
import { SET_V2_DATASET_FOLDERS } from './mutations/SET_V2_DATASET_FOLDERS'
import { TAG_SELECTED_DATASET_ITEMS } from './mutations/TAG_SELECTED_DATASET_ITEMS'
import { UNTAG_SELECTED_DATASET_ITEMS } from './mutations/UNTAG_SELECTED_DATASET_ITEMS'
import { UPDATE_ITEM_SELECTION } from './mutations/UPDATE_ITEM_SELECTION'
import { UPDATE_V2_ITEM_SELECTION } from './mutations/UPDATE_V2_ITEM_SELECTION'
import { DatasetState, createBlankCurrentDataset, getInitialState } from './state'

// mutations
export const mutations: MutationTree<DatasetState> = {
  ARCHIVE_SELECTED_DATASET_ITEMS,
  ASSIGN_SELECTED_ITEMS,
  MOVE_SELECTED_ITEMS_TO_PATH,
  PUSH_DATASET_ITEMS,
  PUSH_WORKFORCE_MANAGERS,
  REMOVE_DATASET_ITEMS_BY_IDS,
  REMOVE_SELECTED_DATASET_ITEMS,
  RESTORE_SELECTED_DATASET_ITEMS,
  SET_DATASET_FOLDERS,
  SET_DATASET_ITEM_FILENAMES,
  SET_EXPORT_COMPLETE_COUNT,
  SET_ITEM_STATUS,
  SET_SELECTED_ALL_ITEMS,
  SET_SELECTED_ITEMS,
  SET_SELECTED_ITEMS_PRIORITY,
  SET_STAGE_NUMBER,
  SET_V2_DATASET_FOLDERS,
  TAG_SELECTED_DATASET_ITEMS,
  UNTAG_SELECTED_DATASET_ITEMS,
  UPDATE_ITEM_SELECTION,
  UPDATE_V2_ITEM_SELECTION,

  RESET_CURRENT_DATASET (state) {
    state.currentDataset = createBlankCurrentDataset()
  },

  SET_CURRENT_DATASET_LOADING (state) {
    Vue.set(state.currentDataset, 'loaded', false)
  },

  SET_CURRENT_DATASET_LOADED (state) {
    Vue.set(state.currentDataset, 'loaded', true)
  },

  SET_CURRENT_DATASET_ID (state, datasetId: number) {
    state.currentDataset.id = datasetId
  },

  SET_CURRENT_DATASET_DETAILS (
    state,
    details: DatasetDetailPayload | DatasetItemCountsPayload & { id: number }
  ) {
    state.currentDataset.id = details.id

    state.currentDataset.classCounts = details.class_counts
    state.currentDataset.statusCounts = details.status_counts

    if ('item_count' in details) {
      state.currentDataset.numImages = details.item_count
      state.currentDataset.unfilteredItemCount = details.unfiltered_item_count
    }
  },

  SET_CURRENT_DATASET_ERROR (state, error) {
    Vue.set(state.currentDataset, 'error', error)
  },

  SET_DATASET_ITEMS_LOADING (state) {
    state.datasetItemsLoaded = false
  },

  SET_DATASET_ITEMS_LOADED (state) {
    state.datasetItemsLoaded = true
  },

  SET_DATASET_ITEMS (state, items: DatasetItemPayload[]) {
    state.datasetItems = items
  },

  INIT_V2_DATASET_ITEMS (
    state,
    payload: string[]
  ) {
    state.datasetItemIdsV2 = payload
  },

  SET_V2_DATASET_ITEMS (
    state,
    items: V2DatasetItemPayload[]
  ) {
    const res: { [id: string]: V2DatasetItemPayload } = {}

    items.forEach(item => {
      res[item.id] = item
    })

    state.datasetItemsV2 = {
      ...state.datasetItemsV2,
      ...res
    }
  },

  SET_V2_DATASET_ITEM_STAGE (
    state,
    item: V2DatasetItemPayload
  ) {
    if (!state.datasetItemsV2[item.id]) { return }

    state.datasetItemsV2[item.id].processing_status = item.processing_status
    state.datasetItemsV2[item.id].status = item.status
    state.datasetItemsV2[item.id].workflow_status = item.workflow_status
  },

  CLEAR_V2_DATASET_ITEMS (state) {
    state.datasetItemsV2 = {}
  },

  ADD_DATASET_ITEMS (state, data: DatasetItemPayload[]) {
    const existingIds = state.datasetItems.map(i => i.id)
    const newItems = data.filter(i => !existingIds.includes(i.id))
    state.datasetItems = state.datasetItems.concat(newItems)
  },

  UPDATE_DATASET_ITEMS (state, data: DatasetItemPayload[]) {
    const datasetItems = [...state.datasetItems]
    data.forEach(updatedItem => {
      const originalItem = datasetItems.find((item) => item.id === updatedItem.id)
      if (!originalItem) { return }
      copyAttributes(originalItem, updatedItem)
    })
    state.datasetItems = datasetItems
  },

  SET_CURRENT_DATASET_VIDEO_ITEM (state, data: DatasetItemPayload) {
    state.currentDatasetVideoItem = data
  },

  SET_CURRENT_DATASET_METADATA (state, metadata) {
    Vue.set(state.currentDataset, 'metadata', metadata)
  },

  SET_DATASET_ITEMS_FILTER (state, filter: DatasetItemFilter) {
    state.datasetItemFilter = filter
  },

  SET_DATASET_ITEMS_FILTER_V2 (state, filter: V2DatasetItemFilter) {
    state.datasetItemFilterV2 = filter
  },

  SET_DATASETS (state, datasets: DatasetPayload[]) {
    state.datasets = datasets
      .map(dataset => {
        const oldDataset = state.datasets.find(d => d.id === dataset.id)
        return {
          ...(oldDataset || {}),
          ...dataset
        }
      })
  },

  SET_DATASET_EXPORTS (state, datasetExports) {
    state.datasetExports = datasetExports
  },

  DELETE_EXPORT (state, datasetExportName) {
    const idx = state.datasetExports.findIndex(d => d.name === datasetExportName)
    if (idx < 0) { return }
    state.datasetExports.splice(idx, 1)
  },

  PUSH_DATASET_DETAILS (
    state,
    details: DatasetDetailPayload | DatasetItemCountsPayload & { id: number}
  ) {
    const index = state.datasetDetails.findIndex(d => d.id === details.id)

    if (index > -1) {
      state.datasetDetails.splice(index, 1, details)
    } else {
      state.datasetDetails.push(details)
    }
  },

  SET_CLASSIFICATIONS (state, classes) {
    state.classifications = classes
  },

  REMOVE_DATASET (state, dataset) {
    const { datasets } = state
    const index = datasets.findIndex(p => p.id === dataset.id)
    if (index > -1) {
      state.datasets.splice(index, 1)
    }
  },

  PUSH_DATASET (state, payload) {
    const index = state.datasets.findIndex(p => p.id === payload.id)
    if (index > -1) {
      const newDataset = {
        ...state.datasets[index],
        ...payload
      }
      state.datasets.splice(index, 1, newDataset)
    } else {
      state.datasets.push(payload)
    }
  },

  PUSH_REPORT (state, report) {
    const index = state.reports.findIndex(r => r.id === report.id)
    if (index === -1) {
      state.reports.push(report)
    } else {
      state.reports.splice(index, 1, report)
    }
  },

  PUSH_ANNOTATORS_FOR_DATASET (state, { datasetId, data }) {
    state.annotators = state.annotators.filter(a => a.dataset_id !== datasetId).concat(data)
  },

  // selection

  DESELECT_ALL_ITEMS (state) {
    state.selectedItemIds = []
    state.selectedV2ItemIds = []
  },

  // polling

  SET_ITEM_POLLER_TIMEOUT_HANDLE (
    state,
    params: { id: number, timeoutHandle: number }
  ) {
    const { id, timeoutHandle } = params
    const poller = state.itemsPollers.find(p => p.id === id)
    if (!poller) { return }
    poller.timeoutHandle = timeoutHandle
  },

  REGISTER_DATASET_ITEM_POLLER (state, datasetId: number) {
    const poller: Poller = {
      period: 5000,
      callsWithoutChange: 0,
      id: datasetId,
      timestamp: new Date().getTime()
    }

    const index = state.itemsPollers.findIndex(p => p.id === datasetId)
    if (index === -1) {
      state.itemsPollers.push(poller)
    } else {
      state.itemsPollers.splice(index, 1, poller)
    }
  },

  UNREGISTER_DATASET_ITEM_POLLER (state, datasetId: number) {
    const index = state.itemsPollers.findIndex(p => p.id === datasetId)
    if (index < 0) { return }
    clearTimeout(state.itemsPollers[index].timeoutHandle)
    state.itemsPollers.splice(index, 1)
  },

  INCREASE_POLLER_DELAY (state, poller) {
    poller.callsWithoutChange++
  },

  // reset

  RESET_ALL (state) {
    copyAttributes(state, getInitialState())
  },

  SET_DATA_TAB_COLUMN_COUNT (state, columnCount: number) {
    state.dataTabColumnCount = columnCount
  },

  SET_DATA_TAB_COLUMN_COUNT_V2 (state, columnCount: number) {
    state.dataTabColumnCountV2 = columnCount
  },

  SET_DATA_TAB_VIEW_MODE (state, viewMode: VIEW_MODE) {
    state.dataTabViewMode = viewMode
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

  PUSH_WORKFLOW_TEMPLATES (state, data: WorkflowTemplatePayload[]) {
    const ids = data.map(template => template.id)
    state.workflowTemplates = state.workflowTemplates
      .filter(template => !ids.includes(template.id))
      .concat(data)
  },

  PUSH_WORKFLOW_STAGE_TEMPLATE (state, data: WorkflowStageTemplatePayload) {
    const workflowTemplate = state.workflowTemplates.find(t => t.id === data.workflow_template_id)
    if (!workflowTemplate) { return }
    const idx = workflowTemplate.workflow_stage_templates.findIndex(s => s.id === data.id)
    if (idx < 0) { return }
    workflowTemplate.workflow_stage_templates.splice(idx, 1, data)
  },

  UPDATE_DATASET_DEFAULT_WORKFLOW_TEMPLATE (state, data: WorkflowTemplatePayload) {
    const idx = state.datasets.findIndex(t => t.id === data.dataset_id)
    if (idx < 0) { return }
    state.datasets[idx].default_workflow_template_id = data.id
  },

  SET_FOLDER_ENABLED (state, folderEnabled: boolean) {
    state.folderEnabled = folderEnabled
    saveBoolean(WORKFLOW_FOLDER_ENABLED, state.folderEnabled)
  }
}
